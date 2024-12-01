import { captureException } from '@sentry/react';
import { transportCloseReason, transportErrorReason } from 'modules/RemoteMic/Network/Client/NetworkClient';
import { ClientTransport } from 'modules/RemoteMic/Network/Client/Transport/interface';
import { NetworkMessages } from 'modules/RemoteMic/Network/messages';
import { ForwardedMessage, PARTYKIT_SERVER } from 'modules/RemoteMic/Network/Server/Transport/PartyKitServer';
import { pack, unpack } from 'modules/RemoteMic/Network/utils';
import Listener from 'modules/utils/Listener';

let sentEventType: NetworkMessages['t'] | null = null;
const throttledCaptureException = (error: Error, event: NetworkMessages) => {
  if (event.t === sentEventType) {
    return;
  }
  captureException(error, { extra: { event } });
  sentEventType = event.t;
};

export class PartyKitClientTransport extends Listener<[NetworkMessages]> implements ClientTransport {
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
    // this.connection = new PartySocket({ host: PARTYKIT_SERVER, room: roomId });

    this.connection = new WebSocket(`${PARTYKIT_SERVER}/party/${roomId}`);
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
        console.info('could not parse close reason', event);
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
    if (this.connection?.readyState !== WebSocket.OPEN) {
      throttledCaptureException(new Error(`Trying to send event on connection ${this.connection?.readyState}`), event);
      return;
    }
    this.connection?.send(pack({ t: 'forward', recipients: [this.roomId], payload: event }));
  }

  // readyState >=2 means that the connection is closing or closed
  public isConnected = () => (this.connection?.readyState ?? Infinity) < 2;

  public close = () => {
    this.connection?.close();
  };
}
