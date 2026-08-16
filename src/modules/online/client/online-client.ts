import { v4 as uuid } from 'uuid';

import { PingPongTracker } from '~/modules/network/rpc/ping-pong-tracker';
import { createFireAndForgetProxy, createRpcProxy } from '~/modules/network/rpc/rpc-client';
import { ClientSubscriptionManager } from '~/modules/network/rpc/subscription-manager';
import { trackOnlineRoomConnectAttempt } from '~/modules/online/client/online-analytics';
import { OnlineServerRpc } from '~/modules/online/protocol/room-logic';
import { OnlineMessages, OnlineRoomState, OnlineSubscriptionChannels } from '~/modules/online/protocol/types';
import isE2E from '~/modules/utils/is-e2-e';
import Listener from '~/modules/utils/listener';
import storage from '~/modules/utils/storage';

const PARTICIPANT_ID_KEY = 'ONLINE_PARTICIPANT_ID';
export const ONLINE_NAME_KEY = 'ONLINE_PARTICIPANT_NAME';

// E2E runs against the local `partykit dev` server started by the Playwright webServer config
export const getOnlinePartyKitServer = (): string =>
  isE2E() ? 'ws://localhost:1999' : (import.meta.env.VITE_APP_ONLINE_PARTYKIT_URL ?? 'ws://localhost:1999');

export type OnlineConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'rejected'
  | 'error';

interface JoinedMessage {
  t: 'joined';
  state: OnlineRoomState;
}
interface JoinRejectedMessage {
  t: 'join-rejected';
  reason: string;
}
type IncomingMessage = OnlineMessages | JoinedMessage | JoinRejectedMessage;

/** JSON-over-WebSocket transport to the online PartyKit room, shaped to satisfy the
 * RPC core's RpcClientTransport. */
class OnlineTransport extends Listener<[IncomingMessage]> {
  private connection: WebSocket | null = null;

  public open = (url: string, onOpen: () => void, onClose: (event: CloseEvent) => void) => {
    this.connection = new WebSocket(url);
    this.connection.onopen = onOpen;
    this.connection.onmessage = (event) => {
      try {
        this.onUpdate(JSON.parse(event.data));
      } catch {
        // ignore malformed frames
      }
    };
    this.connection.onclose = onClose;
  };

  public sendEvent = (message: unknown) => {
    if (this.connection?.readyState === WebSocket.OPEN) {
      this.connection.send(JSON.stringify(message));
    }
  };

  public isConnected = () => (this.connection?.readyState ?? Infinity) < 2;

  public close = () => {
    const connection = this.connection;
    this.connection = null;
    connection?.close();
  };
}

export class OnlineClient extends Listener<[OnlineConnectionStatus, string?]> {
  private transport: OnlineTransport | undefined;
  private participantId: string | null = storage.getItem(PARTICIPANT_ID_KEY);
  private roomCode: string | null = null;
  private name = '';
  private createRoom = false;
  private status: OnlineConnectionStatus = 'disconnected';
  private shouldReconnect = false;
  private clockOffsetMs = 0;
  private pingPong = new PingPongTracker();

  public readonly subscriptions = new ClientSubscriptionManager<OnlineSubscriptionChannels>();

  public readonly rpc: OnlineServerRpc = createRpcProxy(
    () => this.transport,
    (callback) => {
      const handler = (status: OnlineConnectionStatus) => {
        if (status === 'disconnected' || status === 'reconnecting' || status === 'error' || status === 'rejected') {
          callback();
        }
      };
      this.addListener(handler);
      return () => this.removeListener(handler);
    },
  );

  /** Same calls as `rpc`, but nothing to await and rejections are swallowed — for the many
   * notify-the-room calls whose result nobody reads. */
  public readonly send = createFireAndForgetProxy(this.rpc);

  public getParticipantId = () => {
    if (this.participantId === null) {
      this.participantId = uuid();
      storage.setItem(PARTICIPANT_ID_KEY, this.participantId);
    }
    return this.participantId;
  };

  public getStatus = () => this.status;
  public getRoomCode = () => this.roomCode;
  public getName = () => this.name;

  // Tracks the outcome of the current connect() call once, whichever of 'connected'/'rejected'
  // is reached first — reconnects after that (dropped connection, retries) aren't new attempts.
  private hasTrackedConnectAttempt = false;

  private setStatus = (status: OnlineConnectionStatus, detail?: string) => {
    this.status = status;
    if (!this.hasTrackedConnectAttempt && (status === 'connected' || status === 'rejected')) {
      this.hasTrackedConnectAttempt = true;
      trackOnlineRoomConnectAttempt(
        this.createRoom ? 'create' : 'join',
        status === 'connected' ? 'success' : 'failed',
        detail,
      );
    }
    this.onUpdate(status, detail);
  };

  public connect = (roomCode: string, name: string, { create = false } = {}) => {
    const lcRoomCode = roomCode.toLowerCase();
    if (this.transport?.isConnected() && this.roomCode === lcRoomCode) {
      return;
    }
    this.disconnect();
    this.roomCode = lcRoomCode;
    this.name = name;
    this.createRoom = create;
    this.shouldReconnect = true;
    this.hasTrackedConnectAttempt = false;
    this.openSocket(false);
  };

  private openSocket = (isReconnect: boolean) => {
    if (!this.roomCode) return;
    this.setStatus(isReconnect ? 'reconnecting' : 'connecting');

    const transport = new OnlineTransport();
    this.transport = transport;

    // pid identifies the participant; the connection id (_pk) stays unique per socket so a
    // stale socket closing (e.g. quick reconnects/StrictMode remounts) can't evict a fresh one
    const url = `${getOnlinePartyKitServer()}/party/${this.roomCode}?pid=${this.getParticipantId()}&name=${encodeURIComponent(this.name)}${this.createRoom ? '&create=1' : ''}`;

    transport.open(
      url,
      () => {
        // wait for the server's join verdict before reporting connected
      },
      (event) => {
        if (this.transport !== transport) return;
        if (this.status === 'rejected') return;
        // 4000 = join rejected — the join-rejected message itself may be lost when the
        // server closes right after sending it (observed on Firefox), so also read the code
        if (event?.code === 4000) {
          this.shouldReconnect = false;
          this.setStatus('rejected', event.reason || 'rejected');
          return;
        }
        if (this.shouldReconnect) {
          this.setStatus('reconnecting');
          setTimeout(() => {
            if (this.shouldReconnect && this.transport === transport) {
              this.openSocket(true);
            }
          }, 1_500);
        } else {
          this.setStatus('disconnected');
        }
      },
    );

    transport.addListener((message) => {
      if (message.t === 'joined') {
        this.setStatus('connected');
        this.pingPong.start(this.sendPing);
        this.subscriptions.setSendFunctions(
          (channel) => this.transport?.sendEvent({ t: 'rpc-sub', channel }),
          (channel) => this.transport?.sendEvent({ t: 'rpc-unsub', channel }),
        );
        this.subscriptions.handlePublish('room-state', message.state);
        void this.estimateClockOffset();
      } else if (message.t === 'join-rejected') {
        this.shouldReconnect = false;
        this.setStatus('rejected', message.reason);
      } else if (message.t === 'rpc-pub') {
        this.subscriptions.handlePublish(
          message.channel,
          message.data as OnlineSubscriptionChannels[keyof OnlineSubscriptionChannels] as never,
        );
      } else if (message.t === 'ping') {
        this.transport?.sendEvent({ t: 'pong' });
      } else if (message.t === 'pong') {
        this.pingPong.handlePong();
      }
    });
  };

  private sendPing = () => {
    if (!this.transport?.isConnected()) return;
    this.transport.sendEvent({ t: 'ping' });
  };

  /** Latest measured round-trip latency to the room server, ms. */
  public getLatency = () => this.pingPong.getLatency();

  public disconnect = () => {
    this.shouldReconnect = false;
    this.pingPong.stop();
    this.transport?.clearAllListeners();
    this.transport?.close();
    this.transport = undefined;
    this.roomCode = null;
    if (this.status !== 'disconnected') {
      this.setStatus('disconnected');
    }
  };

  /** Estimates server-clock offset by sampling getServerTime and taking the median. */
  private estimateClockOffset = async () => {
    const samples: number[] = [];
    for (let i = 0; i < 5; i++) {
      try {
        const before = Date.now();
        const serverTime = await this.rpc.room.getServerTime();
        const after = Date.now();
        samples.push(serverTime + (after - before) / 2 - after);
      } catch {
        break;
      }
    }
    if (samples.length) {
      samples.sort((a, b) => a - b);
      this.clockOffsetMs = samples[Math.floor(samples.length / 2)];
    }
  };

  /** Current time on the room server's clock (ms). */
  public serverNow = () => Date.now() + this.clockOffsetMs;

  /** Converts a server timestamp to the local clock. */
  public serverTimeToLocal = (serverTimeMs: number) => serverTimeMs - this.clockOffsetMs;
}

/** Checks (over HTTP) whether a room code was actually opened, without joining it. */
export const checkRoomExists = async (roomCode: string): Promise<boolean> => {
  try {
    const base = getOnlinePartyKitServer().replace(/^ws/, 'http');
    const response = await fetch(`${base}/party/${roomCode.toLowerCase()}`);
    if (!response.ok) return false;
    const data = (await response.json()) as { created?: boolean };
    return !!data.created;
  } catch {
    return false;
  }
};

export default new OnlineClient();
