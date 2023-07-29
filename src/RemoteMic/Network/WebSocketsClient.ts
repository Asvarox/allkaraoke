import events from 'GameEvents/GameEvents';
import {
    WebRTCEvents,
    WebRTCRequestMicSelectEvent,
    WebRTCSongListEvent,
    WebRTCSubscribeEvent,
    WebRTCUnsubscribeEvent,
    keyStrokes,
} from 'RemoteMic/Network/events';
import { getPingTime } from 'RemoteMic/Network/utils';
import SimplifiedMic from 'Scenes/Game/Singing/Input/SimplifiedMic';
import { throttle } from 'lodash-es';
import storage from 'utils/storage';
import { v4 } from 'uuid';
import { ForwardedMessage, WEBSOCKETS_SERVER, WebsocketMessage } from './WebSocketsServer';
import sendEvent from './sendEvent';

export const MIC_ID_KEY = 'MIC_CLIENT_ID';

const roundTo = (num: number, precision: number) => {
    if (num === 0) return 0;

    const multiplier = Math.pow(10, precision);

    return Math.round(num * multiplier) / multiplier;
};

class WebSocketsClient {
    private clientId = storage.getValue(MIC_ID_KEY);
    private roomId: string | null = null;

    private connection: WebSocket | null = null;
    private reconnecting = false;
    private connected = false;

    private frequencies: number[] = [];

    private sendFrequencies = throttle((volume: number) => {
        const freqs = this.frequencies.map((freq) => roundTo(freq, 2));
        this.frequencies.length = 0;
        this.sendEvent('freq', [freqs, roundTo(volume, 4)]);
    }, 50);

    // Chunk frequencies and send them in packages
    // One package throttled with 75ms contains ~10 frequencies
    private onFrequencyUpdate = throttle((freq: number, volume: number) => {
        this.frequencies.push(freq);

        this.sendFrequencies(volume);
    }, 1_000 / 60);

    public getClientId = () => this.clientId;
    private setClientId = (id: string) => {
        this.clientId = id;
        storage.storeValue(MIC_ID_KEY, id);
    };

    public connect = (roomId: string, name: string, silent: boolean) => {
        if (this.isConnected()) {
            console.log('not reconnecting', this.connection?.readyState);
            return;
        }
        this.roomId = roomId;

        if (this.clientId === null) this.setClientId(v4());

        this.connection = new WebSocket(WEBSOCKETS_SERVER);

        this.connection.onopen = () => {
            this.connection?.send(JSON.stringify({ t: 'register-player', id: this.clientId, roomId: this.roomId }));

            this.connectToServer(roomId, name, silent);
        };

        this.connection.onerror = (e) => console.warn(e);

        this.connection.onclose = (e) => {
            console.log('closed connection :o', e);
            window.removeEventListener('beforeunload', this.disconnect);

            if (this.reconnecting) {
                events.karaokeConnectionStatusChange.dispatch('reconnecting');
            } else if (!this.connected) {
                const error = JSON.parse(e.reason);
                events.karaokeConnectionStatusChange.dispatch('error', error.error);
            } else {
                events.karaokeConnectionStatusChange.dispatch('disconnected');
            }

            events.remoteMicPlayerSet.dispatch(null);
            events.remoteKeyboardLayout.dispatch(undefined);

            SimplifiedMic.removeListener(this.onFrequencyUpdate);
            SimplifiedMic.stopMonitoring();

            if (!this.reconnecting && this.connected) {
                this.reconnecting = true;
                setTimeout(() => this.reconnect(roomId, name), 1500);
            }
            this.connected = false;
        };
    };

    public latency = 999;
    public pingStart = Date.now();
    public pinging = false;
    private ping = () => {
        this.pinging = true;
        this.pingStart = getPingTime();

        this.sendEvent('ping', { p: this.pingStart });
    };

    private onPong = () => {
        this.latency = getPingTime() - this.pingStart;
        this.pinging = false;

        setTimeout(this.ping, 1000);
    };

    public connectToServer = (roomId: string, name: string, silent: boolean) => {
        console.log(this.clientId);
        events.karaokeConnectionStatusChange.dispatch('connecting');

        this.connection?.addEventListener('message', (message) => {
            try {
                const payload: WebsocketMessage = JSON.parse(message.data);
                // @ts-ignore
                if (!['ping', 'pong'].includes(payload?.payload?.t)) console.log('received', payload);

                if (payload.t === 'connected') {
                    this.connected = true;
                    this.reconnecting = false;
                    events.karaokeConnectionStatusChange.dispatch('connected');
                    this.sendEvent('register', { name, id: this.clientId!, silent });
                    this.ping();
                    window.addEventListener('beforeunload', this.disconnect);
                } else if (payload.t === 'forward') {
                    const { payload: data }: ForwardedMessage = payload;

                    const type = data.t;

                    if (type === 'start-monitor') {
                        SimplifiedMic.removeListener(this.onFrequencyUpdate);
                        SimplifiedMic.addListener(this.onFrequencyUpdate);
                        // echoCancellation is turned on because without it there is silence from the mic
                        // every other second (possibly some kind of Chrome Mobile bug)
                        SimplifiedMic.startMonitoring(undefined, true);
                    } else if (type === 'stop-monitor') {
                        SimplifiedMic.removeListener(this.onFrequencyUpdate);
                        SimplifiedMic.stopMonitoring();
                    } else if (type === 'set-player-number') {
                        events.remoteMicPlayerSet.dispatch(data.playerNumber);
                    } else if (type === 'keyboard-layout') {
                        events.remoteKeyboardLayout.dispatch(data.help);
                    } else if (type === 'reload-mic') {
                        window.removeEventListener('beforeunload', this.disconnect);
                        this.sendEvent('unregister');
                        window.sessionStorage.setItem('reload-mic-request', '1');
                        document.getElementById('phone-ui-container')?.remove();
                        window.location.reload();
                    } else if (type === 'request-readiness') {
                        events.remoteReadinessRequested.dispatch();
                    } else if (type === 'pong') {
                        this.onPong();
                    } else if (type === 'ping') {
                        this.sendEvent('pong');
                    } else if (type === 'set-permissions') {
                        events.remoteMicPermissionsSet.dispatch(data.level);
                    } else if (type === 'remote-mics-list') {
                        events.remoteMicListUpdated.dispatch(data.list);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        });
    };

    private reconnect = (roomId: string, name: string) => {
        if (this.reconnecting) {
            events.karaokeConnectionStatusChange.dispatch('reconnecting');
            this.connect(roomId, name, false);
            setTimeout(() => this.reconnect(roomId, name), 2000);
        }
    };

    public sendKeyStroke = (key: keyStrokes) => {
        this.sendEvent('keystroke', { key });
    };

    public searchSong = (search: string) => {
        this.sendEvent('search-song', { search });
    };

    public requestPlayerChange = (id: string, playerNumber: number | null) => {
        this.sendEvent<WebRTCRequestMicSelectEvent>('request-mic-select', { id, playerNumber });
    };

    public confirmReadiness = () => {
        this.sendEvent('confirm-readiness');
    };

    public subscribe = (channel: WebRTCSubscribeEvent['channel']) => {
        this.sendEvent<WebRTCSubscribeEvent>('subscribe-event', { channel });
    };

    public unsubscribe = (channel: WebRTCSubscribeEvent['channel']) => {
        this.sendEvent<WebRTCUnsubscribeEvent>('unsubscribe-event', { channel });
    };

    public getSongList = () => this.sendRequest<WebRTCSongListEvent>({ t: 'request-songlist' }, 'songlist');

    private sendEvent = <T extends WebRTCEvents>(type: T['t'], payload?: Parameters<typeof sendEvent<T>>[2]) => {
        if (!this.isConnected()) {
            console.debug('not connected, skipping', type, payload);
        } else {
            this.connection?.send(
                JSON.stringify({ t: 'forward', recipients: [this.roomId], payload: { t: type, ...payload } }),
            );
        }
    };

    // readyState >=2 means that the connection is closing or closed
    private isConnected = () => (this.connection?.readyState ?? Infinity) < 2;

    private sendRequest = <T extends WebRTCEvents>({ t, ...payload }: WebRTCEvents, response: T['t']): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.connection?.removeEventListener('message', callback);
                reject('timeout');
            }, 10_000);

            const callback = (message: WebSocketEventMap['message']) => {
                const { payload: data }: ForwardedMessage = JSON.parse(message.data);

                if (data.t === response) {
                    clearTimeout(timeout);
                    this.connection?.removeEventListener('message', callback);
                    resolve(data as T);
                }
            };
            this.connection?.addEventListener('message', callback);

            this.sendEvent(t, payload);
        });
    };

    public disconnect = () => {
        this.connection?.close();
    };
}

export default new WebSocketsClient();
