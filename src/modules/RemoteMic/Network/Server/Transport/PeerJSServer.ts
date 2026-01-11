import { DataConnection, Peer } from 'peerjs';
import {
  SenderInterface,
  ServerTransport,
  transportCloseReason,
} from '~/modules/RemoteMic/Network/Server/Transport/interface';
import { NetworkMessages } from '~/modules/RemoteMic/Network/messages';
import RemoteMicManager from '~/modules/RemoteMic/RemoteMicManager';
import Listener from '~/modules/utils/Listener';
import peerJSOptions from '~/modules/utils/peerJSOptions';

export class PeerJSServerTransport extends Listener<[NetworkMessages, SenderInterface]> implements ServerTransport {
  public readonly name = 'PeerJS';
  private peer: Peer | null = null;

  private connectedPeers: Record<string, DataConnection> = {};

  public connect(
    roomId: string,
    onConnect: () => void,
    _onClose: (reason: transportCloseReason, originalEvent: CloseEvent) => void,
  ) {
    this.peer = new Peer(`allkaraoke-party-room-${roomId}`, peerJSOptions);

    this.peer.on('open', function (id) {
      onConnect();
      console.log('My peer ID is: ' + id);
    });
    this.peer.on('connection', (conn) => {
      this.connectedPeers[conn.peer] = conn;
      conn.on('data', (data: NetworkMessages) => {
        this.onUpdate(data, conn);
      });

      conn.on('error', (data) => console.warn('error', data));

      // iceStateChanged works - close/disconnected/error doesn't for some reason
      // @ts-expect-error `iceStateChanged` is not included in TS definitions
      conn.on('iceStateChanged', (state) => {
        if (state === 'disconnected' || state === 'closed') {
          this.connectedPeers[conn.peer] = conn;
          this.onUpdate({ t: 'unregister' }, conn);
        }
      });

      conn.on('close', () => {
        delete this.connectedPeers[conn.peer];
        RemoteMicManager.removeRemoteMic(conn.peer);
      });
    });
  }

  public getCurrentPing = () => {
    return 0;
  };

  public disconnect = () => {
    this.peer?.disconnect();
  };

  public removePlayer(playerId: string) {
    this.connectedPeers[playerId]?.close();
  }
}
