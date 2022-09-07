import { DataConnection, Peer } from 'peerjs';
import MicInput from 'Scenes/Game/Singing/Input/MicInput';
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
    freqs: [number, number];
    volumes: [number, number];
}

export type WebRTCEvents =
    | WebRTCRegisterEvent
    | WebRTCStartMonitorEvent
    | WebRTCStopMonitorEvent
    | WebRTCNewFrequencyEvent;

class WebRTCClient {
    private clientId = v4();
    private peer: Peer | null = null;
    private connection: DataConnection | null = null;

    private onFrequencyUpdate = (freqs: [number, number], volumes: [number, number]) => {
        this.connection?.send({ type: 'freq', freqs: freqs, volumes: volumes } as WebRTCEvents);
    };

    public connect = (roomId: string, name: string) => {
        this.peer = new Peer(this.clientId, { debug: 3 });

        this.peer.on('open', () => {
            this.connection = this.peer!.connect(roomId);

            this.connection.on('open', () => {
                this.connection?.send({ type: 'register', name, id: this.clientId } as WebRTCEvents);
                this.connection?.on('data', (data: WebRTCEvents) => {
                    if (data.type === 'start-monitor') {
                        MicInput.addListener(this.onFrequencyUpdate);
                        // echoCancellation is turned on because without it there is silence from the mic
                        // every other second (possibly some kind of Chrome Mobile bug)
                        MicInput.startMonitoring(undefined, true);
                    } else if (data.type === 'stop-monitor') {
                        MicInput.removeListener(this.onFrequencyUpdate);
                        MicInput.stopMonitoring();
                    }
                });
            });

            this.connection.on('close', () => {
                MicInput.removeListener(this.onFrequencyUpdate);
                MicInput.stopMonitoring();
            });
        });
        this.peer.on('close', () => {
            MicInput.removeListener(this.onFrequencyUpdate);
            MicInput.stopMonitoring();
        });

        console.log(this.peer);
    };

    public getRoomId = () => this.clientId;
}

export default new WebRTCClient();
