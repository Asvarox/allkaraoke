import { Peer } from 'peerjs';
import { v4 } from 'uuid';
import { WebRTCEvents } from '../Phone/WebRTCClient';
import PhoneManager from './PhonesManager';
import peerJSOptions from 'utils/peerJSOptions';

const ROOM_ID_KEY = 'room_id_key';

class WebRTCServer {
    private roomId = window.sessionStorage.getItem(ROOM_ID_KEY)!;
    private peer: Peer | null = null;
    private started = false;

    public constructor() {
        if (!this.roomId) {
            this.roomId = v4();
        } else {
            this.start();
        }
    }

    public start = () => {
        if (this.started) return;
        this.started = true;
        window.sessionStorage.setItem(ROOM_ID_KEY, this.roomId);

        this.peer = new Peer(this.roomId, peerJSOptions);

        this.peer.on('open', function (id) {
            console.log('My peer ID is: ' + id);
        });

        this.peer.on('connection', (conn) => {
            console.log('id', conn);

            conn.on('data', (data: WebRTCEvents) => {
                if (data.type === 'register') {
                    PhoneManager.addPhone(data.id, data.name, conn);
                }
            });

            conn.on('open', () => {
                console.log('connected');
            });

            conn.on('error', (data) => console.warn('error', data));

            // iceStateChanged works - close/disconnected/error doesn't for some reason
            // @ts-expect-error `iceStateChanged` is not included in TS definitions
            conn.on('iceStateChanged', (state) => {
                if (state === 'disconnected' || state === 'closed') {
                    PhoneManager.removePhone(conn.peer);
                }
            });

            conn.on('close', () => {
                PhoneManager.removePhone(conn.peer);
            });
        });
        this.peer.on('close', () => {
            this.started = false;
        });
    };

    public getRoomId = () => this.roomId;
}

export default new WebRTCServer();
