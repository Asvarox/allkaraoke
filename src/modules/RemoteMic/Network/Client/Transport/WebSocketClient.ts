import { transportCloseReason, transportErrorReason } from 'modules/RemoteMic/Network/Client/NetworkClient';
import { ClientTransport } from 'modules/RemoteMic/Network/Client/Transport/interface';
import { ForwardedMessage, WEBSOCKETS_SERVER } from 'modules/RemoteMic/Network/Server/Transport/WebSocketServer';
import { NetworkMessages } from 'modules/RemoteMic/Network/messages';
import { pack, unpack } from 'modules/RemoteMic/Network/utils';
import Listener from 'modules/utils/Listener';

export class WebSocketClientTransport extends Listener<[NetworkMessages]> implements ClientTransport {
  private connection: WebSocket | null = null;
  private roomId: string | null = null;

  public connect(
    clientId: string,
    roomId: string,
    onConnect: () => void,
    onClose: (reason: transportCloseReason, originalEvent: any) => void,
    onError: (error: transportErrorReason, originalEvent: any) => void,
  ): void {
    this.roomId = roomId;
    this.connection = new WebSocket(WEBSOCKETS_SERVER);
    this.connection.binaryType = 'arraybuffer';

    this.connection.onopen = () => {
      this.connection?.send(pack({ t: 'register-player', id: clientId, roomId: roomId }));
    };

    this.connection.onmessage = (message) => {
      const data = unpack<ForwardedMessage>(message.data);
      if (data.t === 'forward') {
        this.onUpdate(data.payload);
      } else if (data.t === 'connected') {
        onConnect();
      }
    };

    this.connection.onclose = (event) => {
      let reason = 'unknown';
      try {
        reason = JSON.parse(event.reason)?.error;
      } catch (e) {
        console.info('could not parse close reason', event, e);
      }
      this.clearAllListeners();
      onClose(reason, event);
    };

    this.connection.onerror = (event) => {
      this.clearAllListeners();
      onError('error', event);
    };
  }

  public sendEvent(event: NetworkMessages) {
    this.connection?.send(pack({ t: 'forward', recipients: [this.roomId], payload: event }));
  }

  // readyState >=2 means that the connection is closing or closed
  public isConnected = () => (this.connection?.readyState ?? Infinity) < 2;

  public close = () => {
    this.connection?.close();
  };
}
