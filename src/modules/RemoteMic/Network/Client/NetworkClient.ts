import { throttle } from 'lodash-es';
import SimplifiedMic from 'modules/GameEngine/Input/SimplifiedMic';
import events from 'modules/GameEvents/GameEvents';
import { PeerJSClientTransport } from 'modules/RemoteMic/Network/Client/Transport/PeerJSClient';
import { WebSocketClientTransport } from 'modules/RemoteMic/Network/Client/Transport/WebSocketClient';
import { ClientTransport } from 'modules/RemoteMic/Network/Client/Transport/interface';
import {
  NetworkGetGameInputLagResponseMessage,
  NetworkGetMicrophoneLagResponseMessage,
  NetworkMessages,
  NetworkRequestMicSelectMessage,
  NetworkSongListMessage,
  NetworkSubscribeMessage,
  NetworkUnsubscribeMessage,
  keyStrokes,
} from 'modules/RemoteMic/Network/messages';
import sendMessage from 'modules/RemoteMic/Network/sendMessage';
import { getPingTime } from 'modules/RemoteMic/Network/utils';
import { roundTo } from 'modules/utils/roundTo';
import storage from 'modules/utils/storage';
import posthog from 'posthog-js';
import { RemoteMicrophoneLagSetting } from 'routes/Settings/SettingsState';
import { v4 } from 'uuid';

export const MIC_ID_KEY = 'MIC_CLIENT_ID';

export type transportCloseReason = string;
export type transportErrorReason = string;

export class NetworkClient {
  private transport: ClientTransport | undefined;
  private clientId = storage.getItem(MIC_ID_KEY);
  private roomId: string | null = null;

  private reconnecting = false;
  private connected = false;

  private frequencies: number[] = [];

  private sendFrequencies = throttle((volume: number) => {
    const freqs = this.frequencies.map((freq) => roundTo(freq, 2));
    this.frequencies.length = 0;
    this.sendEvent('freq', [freqs, roundTo(volume, 4)]);
  }, 50);

  // Chunk frequencies and send them in packages
  // One package throttled with 75ms contains ~10 frequencies
  private onFrequencyUpdate = throttle((freq: number, volume: number) => {
    this.frequencies.push(freq);

    this.sendFrequencies(volume);
  }, 1_000 / 60);

  public getClientId = () => this.clientId;
  private setClientId = (id: string) => {
    this.clientId = id;
    storage.setItem(MIC_ID_KEY, id);
  };

  public connect = (roomId: string, name: string, silent: boolean) => {
    const lcRoomId = roomId.toLowerCase();
    if (!this.transport) {
      this.transport = lcRoomId.startsWith('w') ? new WebSocketClientTransport() : new PeerJSClientTransport();
    }
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
      this.clientId,
      this.roomId,
      () => {
        this.connectToServer(lcRoomId, name, silent);
      },
      (reason, event) => {
        if (reason === 'unavailable-id') {
          // create new id if the old one is taken
          this.setClientId(v4());
          this.connect(lcRoomId, name, silent);
          return;
        }
        console.log('closed connection :o', reason, event);
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
        events.remoteKeyboardLayout.dispatch(undefined);

        SimplifiedMic.removeListener(this.onFrequencyUpdate);
        SimplifiedMic.stopMonitoring();

        if (!this.reconnecting && this.connected) {
          this.reconnecting = true;
          setTimeout(() => this.reconnect(lcRoomId, name), 1500);
        }
        this.connected = false;
      },
      console.warn,
    );
  };

  public latency = 999;
  public pingStart = getPingTime();
  public pinging = false;
  private ping = () => {
    this.pinging = true;
    this.pingStart = getPingTime();

    this.sendEvent('ping', { p: this.pingStart });
  };

  private reportPing = throttle((ping: number) => posthog.capture('remote_mic_ping', { ping }), 10_000);

  private onPong = () => {
    this.latency = getPingTime() - this.pingStart;
    this.pinging = false;
    this.reportPing(this.latency);

    setTimeout(this.ping, 2_000);
  };

  public connectToServer = (roomId: string, name: string, silent: boolean) => {
    this.connected = true;
    this.reconnecting = false;
    events.karaokeConnectionStatusChange.dispatch('connected');
    posthog.capture('remote_mic_connection_successful', { transport: this.roomId?.charAt(0) });
    this.sendEvent('register', { name, id: this.clientId!, silent, lag: RemoteMicrophoneLagSetting.get() });
    this.ping();
    global?.addEventListener('beforeunload', this.disconnect);

    this.transport!.addListener((data) => {
      const type = data.t;

      if (type === 'start-monitor') {
        SimplifiedMic.removeListener(this.onFrequencyUpdate);
        SimplifiedMic.addListener(this.onFrequencyUpdate);
        // echoCancellation is turned on because without it there is silence from the mic
        // every other second (possibly some kind of Chrome Mobile bug)
        SimplifiedMic.startMonitoring(undefined, true);
      } else if (type === 'stop-monitor') {
        SimplifiedMic.removeListener(this.onFrequencyUpdate);
        SimplifiedMic.stopMonitoring();
      } else if (type === 'set-player-number') {
        events.remoteMicPlayerSet.dispatch(data.playerNumber);
      } else if (type === 'keyboard-layout') {
        events.remoteKeyboardLayout.dispatch(data.help);
      } else if (type === 'reload-mic') {
        global.removeEventListener('beforeunload', this.disconnect);
        this.sendEvent('unregister');
        storage.session.setItem('reload-mic-request', '1');
        document.getElementById('phone-ui-container')?.remove();
        global.location?.reload();
      } else if (type === 'request-readiness') {
        events.remoteReadinessRequested.dispatch();
      } else if (type === 'pong') {
        this.onPong();
      } else if (type === 'ping') {
        this.sendEvent('pong');
      } else if (type === 'set-permissions') {
        events.remoteMicPermissionsSet.dispatch(data.level);
      } else if (type === 'remote-mics-list') {
        events.remoteMicListUpdated.dispatch(data.list);
      } else if (type === 'style-change') {
        events.remoteStyleChanged.dispatch(data.style);
      }
    });
  };

  private reconnect = (roomId: string, name: string) => {
    if (this.reconnecting) {
      events.karaokeConnectionStatusChange.dispatch('reconnecting');
      this.connect(roomId, name, false);
      setTimeout(() => this.reconnect(roomId, name), 2000);
    }
  };

  public sendKeyStroke = (key: keyStrokes) => {
    this.sendEvent('keystroke', { key });
  };

  public searchSong = (search: string) => {
    this.sendEvent('search-song', { search });
  };

  public requestPlayerChange = (id: string, playerNumber: 0 | 1 | 2 | 3 | null) => {
    this.sendEvent<NetworkRequestMicSelectMessage>('request-mic-select', { id, playerNumber });
  };

  public confirmReadiness = () => {
    this.sendEvent('confirm-readiness');
  };

  public subscribe = (channel: NetworkSubscribeMessage['channel']) => {
    this.sendEvent<NetworkSubscribeMessage>('subscribe-event', { channel });
  };

  public unsubscribe = (channel: NetworkSubscribeMessage['channel']) => {
    this.sendEvent<NetworkUnsubscribeMessage>('unsubscribe-event', { channel });
  };

  public getSongList = () => this.sendRequest<NetworkSongListMessage>({ t: 'request-songlist' }, 'songlist');

  public getGameInputLag = () =>
    this.sendRequest<NetworkGetGameInputLagResponseMessage>(
      { t: 'get-game-input-lag-request' },
      'get-game-input-lag-response',
    );

  public setGameInputLag = (value: number) =>
    this.sendRequest<NetworkGetGameInputLagResponseMessage>(
      { t: 'set-game-input-lag-request', value },
      'get-game-input-lag-response',
    );
  public getMicrophoneInputLag = () =>
    this.sendRequest<NetworkGetMicrophoneLagResponseMessage>(
      { t: 'get-microphone-lag-request' },
      'get-microphone-lag-response',
    );

  public setMicrophoneInputLag = (value: number) =>
    this.sendRequest<NetworkGetMicrophoneLagResponseMessage>(
      { t: 'set-microphone-lag-request', value },
      'get-microphone-lag-response',
    );

  private sendEvent = <T extends NetworkMessages>(type: T['t'], payload?: Parameters<typeof sendMessage<T>>[2]) => {
    if (!this.transport?.isConnected()) {
      console.debug('not connected, skipping', type, payload);
    } else {
      this.transport!.sendEvent({ t: type, ...payload } as T);
    }
  };

  private sendRequest = <T extends NetworkMessages>(
    { t, ...payload }: NetworkMessages,
    response: T['t'],
  ): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.transport?.removeListener(callback);
        reject(`${t} timed out waiting for ${response}`);
      }, 10_000);

      const callback = (event: NetworkMessages) => {
        if (event.t === response) {
          clearTimeout(timeout);
          this.transport?.removeListener(callback);
          resolve(event as T);
        }
      };
      this.transport?.addListener(callback);

      this.sendEvent(t, payload);
    });
  };

  public disconnect = () => {
    this.transport?.close();
  };
}
