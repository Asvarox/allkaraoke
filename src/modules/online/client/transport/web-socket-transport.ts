import { OnlineClientTransport } from '~/modules/online/client/transport/interface';
import { OnlineMessages } from '~/modules/online/protocol/types';

/**
 * JSON-over-WebSocket to the server-authoritative room Durable Object — the transport online mode
 * shipped with, used whenever the P2P feature flag is off.
 *
 * Deliberately dumb: the room on the other end runs the same `OnlineRoomLogic` and speaks the same
 * wire protocol as the in-browser host, so everything above this layer is shared between the two
 * modes.
 */
export class WebSocketRoomTransport implements OnlineClientTransport {
  private connection: WebSocket | null = null;
  private listeners = new Set<(message: OnlineMessages) => void>();

  public open = (url: string, onOpen: () => void, onClose: (event: CloseEvent) => void) => {
    this.connection = new WebSocket(url);
    this.connection.onopen = onOpen;
    this.connection.onmessage = (event: MessageEvent<string>) => {
      let message: OnlineMessages;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      this.listeners.forEach((listener) => listener(message));
    };
    this.connection.onclose = onClose;
  };

  public sendEvent = (message: unknown) => {
    if (this.connection?.readyState === WebSocket.OPEN) {
      this.connection.send(JSON.stringify(message));
    }
  };

  public isConnected = () => this.connection?.readyState === WebSocket.OPEN;

  public addListener = (listener: (message: OnlineMessages) => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public removeListener = (listener: (message: OnlineMessages) => void) => {
    this.listeners.delete(listener);
  };

  public clearAllListeners = () => this.listeners.clear();

  public close = () => {
    const connection = this.connection;
    this.connection = null;
    connection?.close();
  };
}
