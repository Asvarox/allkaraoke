import {
  SenderInterface,
  ServerTransport,
  transportCloseReason,
} from 'modules/RemoteMic/Network/Server/Transport/interface';
import { NetworkMessages } from 'modules/RemoteMic/Network/messages';
import RemoteMicManager from 'modules/RemoteMic/RemoteMicManager';
import Listener from 'modules/utils/Listener';
import peerJSOptions from 'modules/utils/peerJSOptions';
import { Peer } from 'peerjs';

export class PeerJSServerTransport extends Listener<[NetworkMessages, SenderInterface]> implements ServerTransport {
  public readonly name = 'PeerJS';
  private peer: Peer | null = null;

  public connect(
    roomId: string,
    onConnect: () => void,
    onClose: (reason: transportCloseReason, originalEvent: any) => void,
  ) {
    this.peer = new Peer(`allkaraoke-party-room-${roomId}`, peerJSOptions);

    this.peer.on('open', function (id) {
      onConnect();
      console.log('My peer ID is: ' + id);
    });
    this.peer.on('connection', (conn) => {
      conn.on('data', (data: NetworkMessages) => {
        this.onUpdate(data, conn);
      });

      conn.on('error', (data) => console.warn('error', data));

      // iceStateChanged works - close/disconnected/error doesn't for some reason
      // @ts-expect-error `iceStateChanged` is not included in TS definitions
      conn.on('iceStateChanged', (state) => {
        if (state === 'disconnected' || state === 'closed') {
          this.onUpdate({ t: 'unregister' }, conn);
        }
      });

      conn.on('close', () => {
        RemoteMicManager.removeRemoteMic(conn.peer);
      });
    });
  }

  public disconnect = () => {
    this.peer?.disconnect();
  };
}
