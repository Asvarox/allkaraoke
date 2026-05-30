import { transportCloseReason, transportErrorReason } from '~/modules/remote-mic/network/client/network-client';
import { ClientTransport } from '~/modules/remote-mic/network/client/transport/interface';
import { NetworkMessages } from '~/modules/remote-mic/network/messages';
import { ForwardedMessage, PARTYKIT_SERVER } from '~/modules/remote-mic/network/server/transport/party-kit-server';
import { pack, unpack } from '~/modules/remote-mic/network/utils';
import Listener from '~/modules/utils/listener';

export class PartyKitClientTransport extends Listener<[NetworkMessages]> implements ClientTransport {
  private connection: WebSocket | null = null;
  private roomId: string | null = null;

  public connect(
    clientId: string,
    roomId: string,
    onConnect: () => void,
    onClose: (reason: transportCloseReason, originalEvent: Event) => void,
    onError: (error: transportErrorReason, originalEvent: Event) => void,
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
    if (this.connection?.readyState !== WebSocket.OPEN) {
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
