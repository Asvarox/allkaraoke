import { DataConnection, Peer } from 'peerjs';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { v4 } from 'uuid';
import PhoneMic from 'Scenes/Game/Singing/Input/PhoneMic';
import peerJSOptions from 'utils/peerJSOptions';
import { keyStrokes, WebRTCEvents } from 'RemoteMic/Network/events';
import sendEvent from './sendEvent';
import { throttle } from 'lodash-es';

const MIC_ID_KEY = 'MIC_CLIENT_ID';

const roundTo = (num: number, precision: number) => {
    if (num === 0) return 0;

    const multiplier = Math.pow(10, precision);

    return Math.round(num * multiplier) / multiplier;
};

class WebRTCClient {
    private clientId = window.sessionStorage.getItem(MIC_ID_KEY);
    private peer: Peer | null = null;
    private connection: DataConnection | null = null;
    private reconnecting = false;

    private onFrequencyUpdate = throttle((freq: number, volume: number) => {
        this.sendEvent('freq', [roundTo(freq, 2), roundTo(volume, 4)]);
    }, 50);

    private setClientId = (id: string) => {
        this.clientId = id;
        window.sessionStorage.setItem(MIC_ID_KEY, id);
    };

    public connect = (roomId: string, name: string, silent: boolean) => {
        if (this.clientId === null) this.setClientId(v4());

        this.peer = new Peer(this.clientId!, { ...peerJSOptions, debug: 3 });

        this.peer.on('open', () => this.connectToServer(roomId, name, silent));
        this.peer.on('close', () => {
            PhoneMic.removeListener(this.onFrequencyUpdate);
            PhoneMic.stopMonitoring();
        });
    };

    public connectToServer = (roomId: string, name: string, silent: boolean) => {
        events.karaokeConnectionStatusChange.dispatch('connecting');
        this.connection = this.peer!.connect(roomId);

        this.connection.on('open', () => {
            this.reconnecting = false;

            this.sendEvent('register', { name, id: this.clientId!, silent });

            events.karaokeConnectionStatusChange.dispatch('connected');

            this.connection?.on('data', (data: WebRTCEvents) => {
                const type = data.t;
                console.log('data', data);
                if (type === 'start-monitor') {
                    PhoneMic.addListener(this.onFrequencyUpdate);
                    // echoCancellation is turned on because without it there is silence from the mic
                    // every other second (possibly some kind of Chrome Mobile bug)
                    PhoneMic.startMonitoring(undefined, true);
                } else if (type === 'stop-monitor') {
                    PhoneMic.removeListener(this.onFrequencyUpdate);
                    PhoneMic.stopMonitoring();
                } else if (type === 'set-player-number') {
                    events.remoteMicPlayerNumberSet.dispatch(data.playerNumber);
                } else if (type === 'keyboard-layout') {
                    events.remoteKeyboardLayout.dispatch(data.help);
                } else if (type === 'reload-mic') {
                    this.sendEvent('unregister');
                    window.sessionStorage.setItem('reload-mic-request', '1');
                    document.getElementById('phone-ui-container')?.remove();
                    window.location.reload();
                } else if (type === 'request-readiness') {
                    events.remoteReadinessRequested.dispatch();
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
            this.connectToServer(roomId, name, false);
            setTimeout(() => this.reconnect(roomId, name), 1000);
        }
    };

    public getRoomId = () => this.clientId;

    public sendKeyStroke = (key: keyStrokes) => {
        this.sendEvent('keystroke', { key });
    };

    public requestPlayerChange = (playerNumber: number | null) => {
        this.sendEvent('request-mic-select', { playerNumber });
    };

    public confirmReadiness = () => {
        this.sendEvent('confirm-readiness');
    };

    private sendEvent = <T extends WebRTCEvents>(type: T['t'], payload?: Parameters<typeof sendEvent<T>>[2]) => {
        sendEvent(this.connection, type, payload);
    };
}

export default new WebRTCClient();
