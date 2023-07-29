import events from 'GameEvents/GameEvents';
import {
    WebRTCEvents,
    WebRTCGetInputLagResponseEvent,
    WebRTCRequestMicSelectEvent,
    WebRTCSongListEvent,
    WebRTCSubscribeEvent,
    WebRTCUnsubscribeEvent,
    keyStrokes,
} from 'RemoteMic/Network/events';
import { getPingTime, pack, unpack } from 'RemoteMic/Network/utils';
import SimplifiedMic from 'Scenes/Game/Singing/Input/SimplifiedMic';
import { throttle } from 'lodash-es';
import { DataConnection, Peer } from 'peerjs';
import Listener from 'utils/Listener';
import peerJSOptions from 'utils/peerJSOptions';
import storage from 'utils/storage';
import { v4 } from 'uuid';
import { ForwardedMessage, WEBSOCKETS_SERVER } from './TheServer';
import sendEvent from './sendEvent';

export const MIC_ID_KEY = 'MIC_CLIENT_ID';

const roundTo = (num: number, precision: number) => {
    if (num === 0) return 0;

    const multiplier = Math.pow(10, precision);

    return Math.round(num * multiplier) / multiplier;
};

export type transportCloseReason = string;
export type transportErrorReason = string;

export interface ClientTransport extends Listener<[WebRTCEvents]> {
    connect(
        clientId: string,
        roomId: string,
        onConnect: () => void,
        onClose: (reason: transportCloseReason, originalEvent: any) => void,
        onError: (error: transportErrorReason, originalEvent: any) => void,
    ): void;
    sendEvent(event: WebRTCEvents): void;
    isConnected(): boolean;
    close(): void;
}

export class WebSocketClientTransport extends Listener<[WebRTCEvents]> implements ClientTransport {
    private connection: WebSocket | null = null;
    private roomId: string | null = null;

    public connect(
        clientId: string,
        roomId: string,
        onConnect: () => void,
        onClose: (reason: transportCloseReason, originalEvent: any) => void,
        onError: (error: transportErrorReason, originalEvent: any) => void,
    ): void {
        this.roomId = roomId;
        this.connection = new WebSocket(WEBSOCKETS_SERVER);
        this.connection.binaryType = 'arraybuffer';

        this.connection.onopen = () => {
            this.connection?.send(pack({ t: 'register-player', id: clientId, roomId: roomId }));
        };

        this.connection.onmessage = (message) => {
            const data = unpack<ForwardedMessage>(message.data);
            if (data.t === 'forward') {
                this.onUpdate(data.payload);
            } else if (data.t === 'connected') {
                onConnect();
            }
        };

        this.connection.onclose = (event) => {
            let reason = 'unknown';
            try {
                reason = JSON.parse(event.reason)?.error;
            } catch (e) {
                console.info('could not parse close reason', event);
            }
            this.clearAllListeners();
            onClose(reason, event);
        };

        this.connection.onerror = (event) => {
            this.clearAllListeners();
            onError('error', event);
        };
    }

    public sendEvent(event: WebRTCEvents) {
        this.connection?.send(pack({ t: 'forward', recipients: [this.roomId], payload: event }));
    }

    // readyState >=2 means that the connection is closing or closed
    public isConnected = () => (this.connection?.readyState ?? Infinity) < 2;

    public close = () => {
        this.connection?.close();
    };
}

export class PeerJSClientTransport extends Listener<[WebRTCEvents]> implements ClientTransport {
    private peer: Peer | null = null;
    private connection: DataConnection | null = null;
    private roomId: string | null = null;

    private unavailableIdRetries = 0;
    private unavailableIdRetryTimeout: any = null;

    private connectToRoom = (
        roomId: string,
        onConnect: () => void,
        onClose: (reason: transportCloseReason, originalEvent: any) => void,
    ) => {
        this.connection = this.peer!.connect(roomId);

        this.connection.on('open', () => {
            onConnect();
        });

        this.connection.on('close', () => onClose('closed', null));

        this.connection?.on('data', (data: WebRTCEvents) => {
            this.onUpdate(data);
        });
    };

    public connect(
        clientId: string,
        roomId: string,
        onConnect: () => void,
        onClose: (reason: transportCloseReason, originalEvent: any) => void,
        onError: (error: transportErrorReason, originalEvent: any) => void,
    ): void {
        if (this.peer && !this.peer.disconnected) {
            this.connectToRoom(roomId, onConnect, onClose);
        } else {
            this.peer = new Peer(clientId, { ...peerJSOptions, debug: 3 });

            this.peer.on('open', () => {
                this.connectToRoom(roomId, onConnect, onClose);
            });

            this.peer.on('error', (e) => {
                // Happens when the device goes from offline to online
                if (
                    e.type === 'unavailable-id' &&
                    this.unavailableIdRetries < 3 &&
                    this.unavailableIdRetryTimeout === null
                ) {
                    this.peer?.destroy?.();
                    this.unavailableIdRetryTimeout = setTimeout(() => {
                        this.unavailableIdRetryTimeout = null;
                        this.unavailableIdRetries++;
                        this.connect(clientId, roomId, onConnect, onClose, onError);
                    }, 1750);
                } else {
                    this.unavailableIdRetries = 0;
                    console.error(e.type, e);
                    onClose(e.type, e);
                }
            });
        }
    }

    public sendEvent(event: WebRTCEvents) {
        this.connection?.send(event);
    }

    public isConnected = () => !!this.connection?.open && !this.peer?.disconnected;

    public close = () => {
        this.connection?.close();
    };
}

export class TheClient {
    private clientId = storage.getValue(MIC_ID_KEY);
    private roomId: string | null = null;

    private reconnecting = false;
    private connected = false;

    private frequencies: number[] = [];

    public constructor(private transport: ClientTransport) {}

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
        if (this.clientId === null) this.setClientId(v4());
        this.roomId = roomId;

        if (this.transport.isConnected()) {
            console.log('not reconnecting', this.transport);
            return;
        }

        if (!this.reconnecting) {
            events.karaokeConnectionStatusChange.dispatch('connecting');
        }
        this.transport.connect(
            this.clientId,
            this.roomId,
            () => {
                this.connectToServer(roomId, name, silent);
            },
            (reason, event) => {
                console.log('closed connection :o', reason, event);
                window.removeEventListener('beforeunload', this.disconnect);

                if (this.reconnecting) {
                    events.karaokeConnectionStatusChange.dispatch('reconnecting');
                } else if (!this.connected) {
                    events.karaokeConnectionStatusChange.dispatch('error', reason);
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
            },
            console.warn,
        );
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
        this.connected = true;
        this.reconnecting = false;
        events.karaokeConnectionStatusChange.dispatch('connected');
        this.sendEvent('register', { name, id: this.clientId!, silent });
        this.ping();
        window.addEventListener('beforeunload', this.disconnect);

        this.transport.addListener((data) => {
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

    public getInputLag = () =>
        this.sendRequest<WebRTCGetInputLagResponseEvent>({ t: 'get-input-lag-request' }, 'get-input-lag-response');

    public setInputLag = (value: number) =>
        this.sendRequest<WebRTCGetInputLagResponseEvent>(
            { t: 'set-input-lag-request', value },
            'get-input-lag-response',
        );

    private sendEvent = <T extends WebRTCEvents>(type: T['t'], payload?: Parameters<typeof sendEvent<T>>[2]) => {
        if (!this.transport.isConnected()) {
            console.debug('not connected, skipping', type, payload);
        } else {
            this.transport.sendEvent({ t: type, ...payload } as T);
        }
    };

    private sendRequest = <T extends WebRTCEvents>({ t, ...payload }: WebRTCEvents, response: T['t']): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.transport.removeListener(callback);
                reject('timeout');
            }, 10_000);

            const callback = (event: WebRTCEvents) => {
                if (event.t === response) {
                    clearTimeout(timeout);
                    this.transport.removeListener(callback);
                    resolve(event as T);
                }
            };
            this.transport.addListener(callback);

            this.sendEvent(t, payload);
        });
    };

    public disconnect = () => {
        this.transport.close();
    };
}
