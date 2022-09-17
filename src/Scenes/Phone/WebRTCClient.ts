import { DataConnection, Peer } from 'peerjs';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
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

export interface WebRTCUnregisterEvent {
    type: 'unregister';
}

export interface WebRTCStopMonitorEvent {
    type: 'stop-monitor';
}

export interface WebRTCSetPlayerNumber {
    type: 'set-player-number';
    playerNumber: number | null;
}

export interface WebRTCNewFrequencyEvent {
    type: 'freq';
    freqs: [number, number];
    volumes: [number, number];
}

export type WebRTCEvents =
    | WebRTCSetPlayerNumber
    | WebRTCRegisterEvent
    | WebRTCStartMonitorEvent
    | WebRTCStopMonitorEvent
    | WebRTCNewFrequencyEvent;

class WebRTCClient {
    private clientId = v4();
    private peer: Peer | null = null;
    private connection: DataConnection | null = null;
    private reconnecting = false;

    private onFrequencyUpdate = (freqs: [number, number], volumes: [number, number]) => {
        this.connection?.send({ type: 'freq', freqs: freqs, volumes: volumes } as WebRTCEvents);
    };

    public connect = (roomId: string, name: string) => {
        this.peer = new Peer(this.clientId, { debug: 3 });

        this.peer.on('open', () => this.connectToServer(roomId, name));
        this.peer.on('close', () => {
            MicInput.removeListener(this.onFrequencyUpdate);
            MicInput.stopMonitoring();
        });
    };

    public connectToServer = (roomId: string, name: string) => {
        events.karaokeConnectionStatusChange.dispatch('connecting');
        this.connection = this.peer!.connect(roomId);

        this.connection.on('open', () => {
            this.reconnecting = false;

            this.connection?.send({ type: 'register', name, id: this.clientId } as WebRTCEvents);
            events.karaokeConnectionStatusChange.dispatch('connected');
            this.connection?.on('data', (data: WebRTCEvents) => {
                console.log('data', data);
                if (data.type === 'start-monitor') {
                    MicInput.addListener(this.onFrequencyUpdate);
                    // echoCancellation is turned on because without it there is silence from the mic
                    // every other second (possibly some kind of Chrome Mobile bug)
                    MicInput.startMonitoring(undefined, true);
                } else if (data.type === 'stop-monitor') {
                    MicInput.removeListener(this.onFrequencyUpdate);
                    MicInput.stopMonitoring();
                } else if (data.type === 'set-player-number') {
                    events.remoteMicPlayerNumberSet.dispatch(data.playerNumber);
                }
            });
        });

        this.connection.on('error', console.warn);

        this.connection.on('close', () => {
            events.karaokeConnectionStatusChange.dispatch('disconnected');
            MicInput.removeListener(this.onFrequencyUpdate);
            MicInput.stopMonitoring();

            console.log('closed connection :o');

            this.reconnecting = true;
            this.reconnect(roomId, name);
        });
    };

    private reconnect = (roomId: string, name: string) => {
        events.karaokeConnectionStatusChange.dispatch('reconnecting');
        if (this.reconnecting) {
            this.connectToServer(roomId, name);
            setTimeout(() => this.reconnect(roomId, name), 500);
        }
    };

    public getRoomId = () => this.clientId;
}

export default new WebRTCClient();
