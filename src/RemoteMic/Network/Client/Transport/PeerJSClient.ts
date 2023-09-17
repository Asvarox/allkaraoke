import { transportCloseReason, transportErrorReason } from 'RemoteMic/Network/Client/NetworkClient';
import { ClientTransport } from 'RemoteMic/Network/Client/Transport/interface';
import { NetworkMessages } from 'RemoteMic/Network/messages';
import { DataConnection, Peer } from 'peerjs';
import Listener from 'utils/Listener';
import peerJSOptions from 'utils/peerJSOptions';

export class PeerJSClientTransport extends Listener<[NetworkMessages]> implements ClientTransport {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private roomId: string | null = null;

  private unavailableIdRetries = 0;
  private unavailableIdRetryTimeout: any = null;

  private connectToRoom = (
    roomId: string,
    onConnect: () => void,
    onClose: (reason: transportCloseReason, originalEvent: any) => void,
  ) => {
    this.connection = this.peer!.connect(roomId);

    this.connection.on('open', () => {
      onConnect();
    });

    this.connection.on('close', () => onClose('closed', null));

    this.connection?.on('data', (data: NetworkMessages) => {
      console.log(data);
      this.onUpdate(data);
    });
  };

  public connect(
    clientId: string,
    roomId: string,
    onConnect: () => void,
    onClose: (reason: transportCloseReason, originalEvent: any) => void,
    onError: (error: transportErrorReason, originalEvent: any) => void,
  ): void {
    if (this.peer && !this.peer.disconnected) {
      this.connectToRoom(roomId, onConnect, onClose);
    } else {
      this.peer = new Peer(clientId, { ...peerJSOptions, debug: 3 });

      this.peer.on('open', () => {
        this.connectToRoom(roomId, onConnect, onClose);
      });

      this.peer.on('error', (e) => {
        // Happens when the device goes from offline to online
        if (e.type === 'unavailable-id' && this.unavailableIdRetries < 3 && this.unavailableIdRetryTimeout === null) {
          this.peer?.destroy?.();
          this.unavailableIdRetryTimeout = setTimeout(() => {
            this.unavailableIdRetryTimeout = null;
            this.unavailableIdRetries++;
            this.connect(clientId, roomId, onConnect, onClose, onError);
          }, 1750);
        } else {
          this.unavailableIdRetries = 0;
          console.error(e.type, e);
          onClose(e.type, e);
        }
      });
    }
  }

  public sendEvent(event: NetworkMessages) {
    this.connection?.send(event);
  }

  public isConnected = () => !!this.connection?.open && !this.peer?.disconnected;

  public close = () => {
    this.connection?.close();
  };
}
