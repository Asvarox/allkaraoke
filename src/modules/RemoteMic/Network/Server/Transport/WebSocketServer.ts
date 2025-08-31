import {
  SenderInterface,
  ServerTransport,
  transportCloseReason,
} from 'modules/RemoteMic/Network/Server/Transport/interface';
import { NetworkMessages } from 'modules/RemoteMic/Network/messages';
import { getPingTime, pack, unpack } from 'modules/RemoteMic/Network/utils';
import Listener from 'modules/utils/Listener';

export interface ForwardedMessage {
  t: 'forward';
  sender: string;
  payload: NetworkMessages;
}

interface WebsocketConnectedMessage {
  t: 'connected';
}

interface WebsocketPongMessage {
  t: 'pong';
}

export type WebsocketMessage = ForwardedMessage | WebsocketConnectedMessage | WebsocketPongMessage;

export const WEBSOCKETS_SERVER = import.meta.env.VITE_APP_WEBSOCKET_URL;

export class WebSocketServerTransport extends Listener<[NetworkMessages, SenderInterface]> implements ServerTransport {
  public readonly name = 'WebSockets';
  private connection: WebSocket | null = null;

  private sendEvent(event: NetworkMessages) {
    if (this.connection?.readyState !== WebSocket.OPEN) {
      return;
    }
    this.connection?.send(pack(event));
  }

  public constructor() {
    super();
  }

  public connect(
    roomId: string,
    onConnect: () => void,
    onClose: (reason: transportCloseReason, originalEvent: any) => void,
  ) {
    this.connection = new WebSocket(WEBSOCKETS_SERVER);
    this.connection.binaryType = 'arraybuffer';
    this.connection.onopen = () => {
      this.sendEvent({ t: 'register-room', id: roomId });
      onConnect();
      this.ping();

      this.connection?.addEventListener('message', (message) => {
        const payload: WebsocketMessage = unpack(message.data);

        if (payload.t === 'forward') {
          if (!['ping', 'pong', 'freq'].includes(payload?.payload?.t)) console.log('received', payload);
          const { sender, payload: data } = payload;
          const conn = new SenderWrapper(sender, this.connection!);

          this.onUpdate(data, conn);
        } else if (payload.t === 'pong') {
          this.onPong();
        } else {
          console.warn('Unknown message type', payload);
        }
      });
    };

    this.connection.onclose = (event) => {
      onClose(event.reason, event);
    };
  }

  public disconnect = () => {
    this.connection?.close();
  };

  // todo create a a util to share with Network Client
  private latency = 0;
  private pingStart = getPingTime();
  public pinging = false;
  private pingTimeout: ReturnType<typeof setTimeout> | null = null;

  private ping = () => {
    this.pinging = true;
    this.pingStart = getPingTime();

    this.sendEvent({ t: 'ping' });
  };
  private onPong = () => {
    if (!this.pinging) return;
    this.latency = getPingTime() - this.pingStart;
    this.pinging = false;

    if (this.pingTimeout) clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(this.ping, 5_000);
  };

  public getCurrentPing = () => {
    return this.pinging ? Math.max(this.latency, getPingTime() - this.pingStart) : this.latency;
  };

  public removePlayer(playerId: string) {
    this.sendEvent({ t: 'remove-player', id: playerId });
  }
}

type callback = (data: any) => void;

class SenderWrapper implements SenderInterface {
  private currentPing = 0;
  constructor(
    public peer: string,
    private socket: WebSocket,
  ) {}

  public send = (payload: NetworkMessages) => {
    const data = { t: 'forward', recipients: [this.peer], payload };
    if (!['ping', 'pong', 'freq'].includes(payload?.t)) console.log('sending', this.peer, payload);
    this.socket.send(pack(data));
  };

  private callbacksMap: Map<callback, callback> = new Map();

  public on = (event: string, callback: (data: any) => void) => {
    if (event === 'data') {
      this.callbacksMap.set(callback, (message) => {
        const data: WebsocketMessage = unpack(message.data);
        if (data.t === 'forward') {
          const { sender, payload } = data;
          if (sender === this.peer) {
            callback(payload);
          }
        }
      });
      this.socket.addEventListener('message', this.callbacksMap.get(callback)!);
    }
  };

  public off = (event: string, callback: (data: any) => void) => {
    if (event === 'data') {
      const actualCallback = this.callbacksMap.get(callback);
      this.socket.removeEventListener('message', actualCallback!);
      this.callbacksMap.delete(callback);
    }
  };

  public close = () => {
    this.socket.close();
  };
}
