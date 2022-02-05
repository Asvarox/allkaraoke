import Peer from 'peerjs';
import { v4 } from 'uuid';
import { WebRTCEvents } from '../Phone/WebRTCClient';
import PhoneManager from './PhonesManager';

const ROOM_ID_KEY = 'room_id_key';

class WebRTCServer {
    private roomId = window.sessionStorage.getItem(ROOM_ID_KEY)!;
    private peer: Peer | null = null;

    public constructor() {
        if (!this.roomId) {
            const roomId = v4();
            window.sessionStorage.setItem(ROOM_ID_KEY, roomId);

            this.roomId = roomId;
        }
    }

    public start = () => {
        this.peer = new Peer(this.roomId, { debug: 3 });

        this.peer.on('open', function (id) {
            console.log('My peer ID is: ' + id);
        });

        console.log(this.peer);

        this.peer.on('connection', (conn) => {
            console.log('id', conn);

            conn.on('data', (data: WebRTCEvents) => {
                if (data.type === 'register') {
                    PhoneManager.addPhone(data.id, data.name, conn);
                }
            });
            // conn.on('disconnected', (data: WebRTCEvents) => {

            // });
            conn.on('open', () => {
                console.log('connected');
                conn.send('test');
            });
        });
    };

    public getRoomId = () => this.roomId;
}

export default new WebRTCServer();
