import Peer from 'peerjs';
import { v4 } from 'uuid';

export interface WebRTCRegisterEvent {
    type: 'register';
    id: string;
    name: string;
}

export interface WebRTCStartMonitorEvent {
    type: 'start-monitor';
}

export interface WebRTCStopMonitorEvent {
    type: 'stop-monitor';
}

export interface WebRTCNewFrequencyEvent {
    type: 'freq';
    freq: number;
    // i: number;
    // date: string;
}

export type WebRTCEvents =
    | WebRTCRegisterEvent
    | WebRTCStartMonitorEvent
    | WebRTCStopMonitorEvent
    | WebRTCNewFrequencyEvent;

class WebRTCClient {
    private clientId = v4();
    private peer: Peer | null = null;
    private interval: any;

    public connect = (roomId: string, name: string) => {
        this.peer = new Peer(this.clientId, { debug: 3 });

        this.peer.on('open', () => {
            const connection = this.peer!.connect(roomId);

            connection.on('open', () => {
                console.log('peer connected open');
                connection.send({ type: 'register', name, id: this.clientId } as WebRTCEvents);
                connection.on('data', (data: WebRTCEvents) => {
                    console.log('Received', data);
                    if (data.type === 'start-monitor') {
                        let i = 0;
                        console.log(connection.dataChannel);
                        this.interval = setInterval(() => {
                            console.log('attempting to send', i, new Date().getTime());
                            connection.send({ type: 'freq', freq: 440 });
                        }, 32);
                    } else if (data.type === 'stop-monitor') {
                        clearInterval(this.interval);
                    }
                });
            });
        });

        console.log(this.peer);
    };

    public getRoomId = () => this.clientId;
}

export default new WebRTCClient();
