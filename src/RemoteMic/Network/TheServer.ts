import events from 'GameEvents/GameEvents';
import { WebRTCEvents } from 'RemoteMic/Network/events';
import { pack, unpack } from 'RemoteMic/Network/utils';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import { InputLagSetting } from 'Scenes/Settings/SettingsState';
import SongDao from 'Songs/SongsService';
import Listener from 'utils/Listener';
import { v4 } from 'uuid';

const ROOM_ID_KEY = 'room_id_key';

export const WEBSOCKETS_SERVER = import.meta.env.VITE_APP_WEBSOCKET_URL;

export interface ForwardedMessage {
    t: 'forward';
    sender: string;
    payload: WebRTCEvents;
}

interface WebsocketConnectedMessage {
    t: 'connected';
}

export type transportCloseReason = string;
export type transportErrorReason = string;

export interface ServerTransport extends Listener<[WebRTCEvents, SenderWrapper]> {
    connect(
        roomId: string,
        onConnect: () => void,
        onClose: (reason: transportCloseReason, originalEvent: any) => void,
    ): void;
    sendEvent(event: WebRTCEvents): void;
}

export type WebsocketMessage = ForwardedMessage | WebsocketConnectedMessage;

export class WebSocketServerTransport extends Listener<[WebRTCEvents, SenderWrapper]> implements ServerTransport {
    private connection: WebSocket | null = null;
    public constructor(private pswd: string) {
        super();
    }

    public connect(
        roomId: string,
        onConnect: () => void,
        onClose: (reason: transportCloseReason, originalEvent: any) => void,
    ) {
        this.connection = new WebSocket(WEBSOCKETS_SERVER);
        this.connection.binaryType = 'arraybuffer';
        this.connection.onopen = () => {
            this.connection?.send(pack({ t: 'register-room', id: roomId, pswd: this.pswd }));
            onConnect();

            this.connection?.addEventListener('message', (message) => {
                const payload: WebsocketMessage = unpack(message.data);

                // @ts-ignore
                if (!['ping', 'pong', 'freq'].includes(payload?.payload?.t)) console.log('received', payload);

                if (payload.t === 'forward') {
                    const { sender, payload: data } = payload;
                    const conn = new SenderWrapper(sender, this.connection!);

                    this.onUpdate(data, conn);
                }
            });
        };
    }

    public sendEvent = (event: WebRTCEvents) => {};

    public close = () => {
        this.connection?.close();
    };
}

type callback = (data: any) => void;
class SenderWrapper {
    constructor(public peer: string, private socket: WebSocket) {}

    public send = (payload: WebRTCEvents) => {
        const data = { t: 'forward', recipients: [this.peer], payload };
        if (!['ping', 'pong', 'freq'].includes(payload?.t)) console.log('sending', this.peer, payload);
        this.socket.send(pack(data));
    };

    private callbacksMap: Map<callback, callback> = new Map();

    public on = (event: string, callback: (data: any) => void) => {
        if (event === 'data') {
            this.callbacksMap.set(callback, (message) => {
                const data: WebsocketMessage = unpack(message.data);
                if (data.t === 'forward') {
                    const { sender, payload } = data;
                    if (sender === this.peer) {
                        callback(payload);
                    }
                }
            });
            this.socket.addEventListener('message', this.callbacksMap.get(callback)!);
        }
    };

    public off = (event: string, callback: (data: any) => void) => {
        if (event === 'data') {
            const actualCallback = this.callbacksMap.get(callback);
            this.socket.removeEventListener('message', actualCallback!);
            this.callbacksMap.delete(callback);
        }
    };
}

export class TheServer {
    private roomId = window.sessionStorage.getItem(ROOM_ID_KEY)!;
    private started = false;

    public constructor(private transport: ServerTransport) {
        if (!this.roomId) {
            this.roomId = v4();
        }
    }

    public start = () => {
        if (this.started) return;
        this.started = true;
        console.log('connection started', this.roomId);
        window.sessionStorage.setItem(ROOM_ID_KEY, this.roomId);

        this.transport.connect(
            this.roomId,
            () => {
                this.transport.addListener((event, sender) => {
                    const type = event.t;
                    if (type === 'register') {
                        // @ts-ignore
                        RemoteMicManager.addRemoteMic(event.id, event.name, sender, event.silent);
                    } else if (type === 'unregister') {
                        RemoteMicManager.removeRemoteMic(sender.peer, true);
                    } else if (type === 'subscribe-event') {
                        RemoteMicManager.addSubscription(sender.peer, event.channel);
                    } else if (type === 'unsubscribe-event') {
                        RemoteMicManager.removeSubscription(sender.peer, event.channel);
                    } else if (type === 'ping') {
                        sender.send({ t: 'pong' } as WebRTCEvents);
                    } else if (type === 'pong') {
                        RemoteMicManager.getRemoteMicById(sender.peer)?.onPong();
                    } else if (type === 'request-songlist') {
                        Promise.all([SongDao.getLocalIndex(), SongDao.getDeletedSongsList()]).then(
                            ([custom, deleted]) => {
                                sender.send({
                                    t: 'songlist',
                                    custom: custom.map((song) => ({
                                        artist: song.artist,
                                        title: song.title,
                                        video: song.video,
                                        language: song.language,
                                    })),
                                    deleted,
                                });
                            },
                        );
                    } else if (RemoteMicManager.getPermission(sender.peer) === 'write') {
                        if (type === 'keystroke') {
                            events.remoteKeyboardPressed.dispatch(event.key);
                        } else if (type === 'search-song') {
                            events.remoteSongSearch.dispatch(event.search);
                        } else if (type === 'request-mic-select') {
                            events.playerChangeRequested.dispatch(event.id, event.playerNumber);
                        } else if (type === 'get-input-lag-request') {
                            sender.send({ t: 'get-input-lag-response', value: InputLagSetting.get() });
                        } else if (type === 'set-input-lag-request') {
                            InputLagSetting.set(event.value);
                            sender.send({ t: 'get-input-lag-response', value: InputLagSetting.get() });
                        }
                    }
                });
            },
            () => {
                this.started = false;
            },
        );
    };

    public getRoomId = () => this.roomId;
}
