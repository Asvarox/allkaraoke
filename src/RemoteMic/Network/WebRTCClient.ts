import { DataConnection, Peer } from 'peerjs';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { v4 } from 'uuid';
import PhoneMic from 'Scenes/Game/Singing/Input/PhoneMic';
import peerJSOptions from 'utils/peerJSOptions';
import { keyStrokes, WebRTCEvents } from 'RemoteMic/Network/events';
import sendEvent from './sendEvent';

const MIC_ID_KEY = 'MIC_CLIENT_ID';

class WebRTCClient {
    private clientId = window.sessionStorage.getItem(MIC_ID_KEY);
    private peer: Peer | null = null;
    private connection: DataConnection | null = null;
    private reconnecting = false;

    private onFrequencyUpdate = (freqs: [number, number], volumes: [number, number]) => {
        this.sendEvent('freq', { freqs: freqs, volumes: volumes });
    };

    private setClientId = (id: string) => {
        this.clientId = id;
        window.sessionStorage.setItem(MIC_ID_KEY, id);
    };

    public connect = (roomId: string, name: string) => {
        if (this.clientId === null) this.setClientId(v4());

        this.peer = new Peer(this.clientId!, { ...peerJSOptions, debug: 3 });

        this.peer.on('open', () => this.connectToServer(roomId, name));
        this.peer.on('close', () => {
            PhoneMic.removeListener(this.onFrequencyUpdate);
            PhoneMic.stopMonitoring();
        });
    };

    public connectToServer = (roomId: string, name: string) => {
        events.karaokeConnectionStatusChange.dispatch('connecting');
        this.connection = this.peer!.connect(roomId);

        this.connection.on('open', () => {
            this.reconnecting = false;
            console.log('CONNNNECCTED');

            this.sendEvent('register', { name, id: this.clientId! });

            events.karaokeConnectionStatusChange.dispatch('connected');

            this.connection?.on('data', (data: WebRTCEvents) => {
                console.log('data', data);
                if (data.type === 'start-monitor') {
                    PhoneMic.addListener(this.onFrequencyUpdate);
                    // echoCancellation is turned on because without it there is silence from the mic
                    // every other second (possibly some kind of Chrome Mobile bug)
                    PhoneMic.startMonitoring(undefined, true);
                } else if (data.type === 'stop-monitor') {
                    PhoneMic.removeListener(this.onFrequencyUpdate);
                    PhoneMic.stopMonitoring();
                } else if (data.type === 'set-player-number') {
                    events.remoteMicPlayerNumberSet.dispatch(data.playerNumber);
                }
            });
        });

        this.connection.on('error', console.warn);

        this.connection.on('close', () => {
            events.karaokeConnectionStatusChange.dispatch('disconnected');
            events.remoteMicPlayerNumberSet.dispatch(null);
            PhoneMic.removeListener(this.onFrequencyUpdate);
            PhoneMic.stopMonitoring();

            console.log('closed connection :o');

            this.reconnecting = true;
            setTimeout(() => this.reconnect(roomId, name), 500);
        });
    };

    private reconnect = (roomId: string, name: string) => {
        if (this.reconnecting) {
            events.karaokeConnectionStatusChange.dispatch('reconnecting');
            this.connectToServer(roomId, name);
            setTimeout(() => this.reconnect(roomId, name), 1000);
        }
    };

    public getRoomId = () => this.clientId;

    public sendKeyStroke = (key: keyStrokes) => {
        this.sendEvent('keystroke', { key });
    };

    private sendEvent = <T extends WebRTCEvents>(type: T['type'], payload?: Parameters<typeof sendEvent<T>>[2]) => {
        sendEvent(this.connection, type, payload);
    };
}

export default new WebRTCClient();
