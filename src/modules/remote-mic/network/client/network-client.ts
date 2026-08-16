import { throttle } from 'es-toolkit';
import posthog from 'posthog-js';
import { v4 } from 'uuid';

import SimplifiedMic from '~/modules/game-engine/input/simplified-mic';
import events from '~/modules/game-events/game-events';
import { PingPongTracker } from '~/modules/network/rpc/ping-pong-tracker';
import { createRpcProxy } from '~/modules/network/rpc/rpc-client';
import { ExtractContract } from '~/modules/network/rpc/types';
import { ClientTransport } from '~/modules/remote-mic/network/client/transport/interface';
import { PartyKitClientTransport } from '~/modules/remote-mic/network/client/transport/party-kit-client';
import { WebSocketClientTransport } from '~/modules/remote-mic/network/client/transport/web-socket-client';
import { NetworkMessages } from '~/modules/remote-mic/network/messages';
import { serverHandlers } from '~/modules/remote-mic/network/server/server-handlers';
import Listener from '~/modules/utils/listener';
import { roundTo } from '~/modules/utils/round-to';
import storage from '~/modules/utils/storage';
import { RemoteMicrophoneLagSetting } from '~/routes/settings/settings-state';

import { dispatchClientCall, registerClientHandler } from './client-handlers';
import { subscriptionManager } from './subscriptions';

export const MIC_ID_KEY = 'MIC_CLIENT_ID';

export type transportCloseReason = string;
export type transportErrorReason = string;

export type ServerRpc = ExtractContract<typeof serverHandlers>;

export class NetworkClient extends Listener<[NetworkMessages]> {
  private transport: ClientTransport | undefined;
  private clientId = storage.getItem(MIC_ID_KEY);

  private roomId: string | null = null;

  private reconnecting = false;
  private connected = false;
  // The name currently registered (or being registered) with the server — kept up to date by both
  // connect() and renameSelf() so reconnects always re-register with the latest name, not the one
  // captured by the original connect() call
  private currentName = '';

  private frequencies: number[] = [];

  private sendFrequencies = throttle((volume: number) => {
    const freqs = this.frequencies.map((freq) => roundTo(freq, 2));
    this.frequencies.length = 0;
    this.transport?.sendEvent({ t: 'freq', 0: freqs, 1: roundTo(volume, 4) } as NetworkMessages);
  }, 50);

  // Chunk frequencies and send them in packages
  // One package throttled with ~60Hz contains ~10 frequencies
  private onFrequencyUpdate = throttle((freq: number, volume: number) => {
    this.frequencies.push(freq);
    this.sendFrequencies(volume);
  }, 1_000 / 60);

  constructor() {
    super();

    // Register imperative client handlers once so they are not duplicated on reconnect.
    // These use a Set internally, so registering the same function reference is idempotent,
    // but since arrow functions inside connectToServer would create new references each time,
    // we register them here with stable references.
    registerClientHandler('startMonitor', () => {
      SimplifiedMic.removeListener(this.onFrequencyUpdate);
      SimplifiedMic.addListener(this.onFrequencyUpdate);
      SimplifiedMic.startMonitoring();
      events.remoteMicMonitoringStarted.dispatch();
    });
    registerClientHandler('stopMonitor', () => {
      SimplifiedMic.removeListener(this.onFrequencyUpdate);
      SimplifiedMic.stopMonitoring();
      events.remoteMicMonitoringStopped.dispatch();
    });
    registerClientHandler('reload', () => {
      global.removeEventListener('beforeunload', this.disconnect);
      this.transport?.sendEvent({ t: 'unregister' } as NetworkMessages);
      storage.session.setItem('reload-mic-request', '1');
      document.getElementById('phone-ui-container')?.remove();
      global.location?.reload();
    });

    // Bridge handlers: dispatch old GameEvents so legacy consumers keep working.
    // These will be removed once all consumers are migrated to useClientHandler (Phase 6).
    registerClientHandler('setPlayerNumber', (playerNumber) => {
      events.remoteMicPlayerSet.dispatch(playerNumber);
    });
    registerClientHandler('setPermissions', (level) => {
      events.remoteMicPermissionsSet.dispatch(level);
    });
    registerClientHandler('requestReadiness', () => {
      events.remoteReadinessRequested.dispatch();
    });
  }

  // RPC proxy — call server methods as if they were local async functions.
  // The onDisconnect callback rejects any in-flight request immediately when the connection drops,
  // rather than waiting for the 10-second timeout.
  public readonly rpc: ServerRpc = createRpcProxy<typeof serverHandlers>(
    () => this.transport,
    (callback) => {
      const handler = (status: string) => {
        if (status === 'disconnected' || status === 'reconnecting' || status === 'error') {
          callback();
        }
      };
      events.karaokeConnectionStatusChange.subscribe(
        handler as Parameters<typeof events.karaokeConnectionStatusChange.subscribe>[0],
      );
      return () =>
        events.karaokeConnectionStatusChange.unsubscribe(
          handler as Parameters<typeof events.karaokeConnectionStatusChange.subscribe>[0],
        );
    },
  );

  public getClientId = () => this.clientId;
  private setClientId = (id: string) => {
    this.clientId = id;
    storage.setItem(MIC_ID_KEY, id);
  };

  // A no-op while not yet connected — the next real connect() call already sends the current name
  public renameSelf = (name: string) => {
    if (this.connected) {
      this.currentName = name;
      this.rpc.players.setName(name).catch((e) => console.warn('Failed to rename mic', e));
    }
  };

  public connect = (roomId: string, name: string, silent: boolean) => {
    const lcRoomId = roomId.toLowerCase();
    this.currentName = name;
    if (this.transport) {
      this.transport.clearAllListeners();
      this.pingPong.stop();
      this.transport.close();
    }
    this.transport = lcRoomId.startsWith('w')
      ? new WebSocketClientTransport()
      : lcRoomId.startsWith('k')
        ? new PartyKitClientTransport()
        : new PartyKitClientTransport();

    if (this.clientId === null) this.setClientId(v4());
    this.roomId = lcRoomId;

    if (this.transport.isConnected()) {
      console.log('not reconnecting', this.transport);
      return;
    }

    if (!this.reconnecting) {
      events.karaokeConnectionStatusChange.dispatch('connecting');
    }
    this.transport.connect(
      this.clientId!,
      this.roomId,
      () => {
        this.connectToServer(lcRoomId, silent);
      },
      (reason) => {
        // Stop the ping loop as soon as the transport closes — it re-arms itself via
        // connectToServer() on reconnect, but must not keep scheduling pings against a dead
        // transport in the meantime (or forever, on a final disconnect).
        this.pingPong.stop();

        if (reason === 'unavailable-id') {
          // create new id if the old one is taken
          this.setClientId(v4());
          this.connect(lcRoomId, name, silent);
          return;
        }
        global.removeEventListener('beforeunload', this.disconnect);

        if (this.reconnecting) {
          events.karaokeConnectionStatusChange.dispatch('reconnecting');
        } else if (!this.connected) {
          events.karaokeConnectionStatusChange.dispatch('error', reason);
          posthog.capture('remote_mic_connection_error', { reason, transport: this.roomId?.charAt(0) });
        } else {
          events.karaokeConnectionStatusChange.dispatch('disconnected');
        }

        events.remoteMicPlayerSet.dispatch(null);
        // Clear the cached keyboard layout so the subscription-based consumers show nothing while disconnected
        subscriptionManager.handlePublish('keyboard-layout', undefined);

        SimplifiedMic.removeListener(this.onFrequencyUpdate);
        SimplifiedMic.stopMonitoring();

        if (reason !== 'player-removed') {
          if (!this.reconnecting && this.connected) {
            this.reconnecting = true;
            setTimeout(() => this.reconnect(lcRoomId), 1500);
          }
        }

        this.connected = false;
      },
      console.warn,
    );
  };

  private pingPong = new PingPongTracker({
    // 999 until the first pong comes back, so the readout never claims a 0 ms round trip
    initialLatency: 999,
    onMeasurement: (ping) => this.reportPing(ping),
  });

  // Read by the remote-mic ping readout, which counts up while a pong is overdue
  public get latency() {
    return this.pingPong.getLatency();
  }
  public get pingStart() {
    return this.pingPong.getPingStartedAt();
  }
  public get pinging() {
    return this.pingPong.isPinging();
  }

  private ping = () => {
    this.transport?.sendEvent({ t: 'ping' } as NetworkMessages);
  };

  private reportPing = throttle((ping: number) => posthog.capture('remote_mic_ping', { ping }), 60_000);

  public connectToServer = (_roomId: string, silent: boolean) => {
    this.connected = true;
    this.reconnecting = false;
    events.karaokeConnectionStatusChange.dispatch('connected');
    posthog.capture('remote_mic_connection_successful', { transport: this.roomId?.charAt(0) });
    this.transport?.sendEvent({
      t: 'register',
      name: this.currentName,
      id: this.clientId!,
      silent,
      lag: RemoteMicrophoneLagSetting.get(),
    });
    this.pingPong.start(this.ping);
    global?.addEventListener('beforeunload', this.disconnect);

    // Wire subscription manager to send rpc-sub/rpc-unsub via the current transport
    subscriptionManager.setSendFunctions(
      (channel) => this.transport?.sendEvent({ t: 'rpc-sub', channel }),
      (channel) => this.transport?.sendEvent({ t: 'rpc-unsub', channel }),
    );

    this.transport!.addListener((data) => {
      const type = data.t;
      this.onUpdate(data);

      if (type === 'rpc-call') {
        // Server-initiated call — dispatch to registered handlers
        dispatchClientCall(data.method, data.args);
      } else if (type === 'rpc-pub') {
        // Server pushed subscription data
        subscriptionManager.handlePublish(data.channel, data.data);
      } else if (type === 'pong') {
        this.pingPong.handlePong();
      } else if (type === 'ping') {
        this.transport?.sendEvent({ t: 'pong' } as NetworkMessages);
      }
      // rpc-res messages are handled internally by createRpcProxy listeners — no action needed here
    });
  };

  private reconnect = (roomId: string) => {
    if (this.reconnecting) {
      events.karaokeConnectionStatusChange.dispatch('reconnecting');
      this.connect(roomId, this.currentName, false);
      setTimeout(() => this.reconnect(roomId), 2000);
    }
  };

  public disconnect = () => {
    this.transport?.close();
  };
}
