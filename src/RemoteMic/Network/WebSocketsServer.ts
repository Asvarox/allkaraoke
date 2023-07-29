import events from 'GameEvents/GameEvents';
import { WebRTCEvents, WebRTCSongListEvent } from 'RemoteMic/Network/events';
import sendEvent from 'RemoteMic/Network/sendEvent';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import SongDao from 'Songs/SongDao';
import { v4 } from 'uuid';

const ROOM_ID_KEY = 'room_id_key';

// export const WEBSOCKETS_SERVER = 'wss://allkaraoke-posthog.fly.dev';
export const WEBSOCKETS_SERVER = 'ws://localhost:8080';

export interface ForwardedMessage {
    t: 'forward';
    sender: string;
    payload: WebRTCEvents;
}

interface WebsocketConnectedMessage {
    t: 'connected';
}

export type WebsocketMessage = ForwardedMessage | WebsocketConnectedMessage;

type callback = (data: any) => void;
class SenderWrapper {
    constructor(public peer: string, private socket: WebSocket) {}

    public send = (payload: WebRTCEvents) => {
        const data = { t: 'forward', recipients: [this.peer], payload };
        if (!['ping', 'pong', 'freq'].includes(payload?.t)) console.log('sending', this.peer, payload);
        this.socket.send(JSON.stringify(data));
    };

    private callbacksMap: Map<callback, callback> = new Map();

    public on = (event: string, callback: (data: any) => void) => {
        console.log(this.peer, event);
        if (event === 'data') {
            this.callbacksMap.set(callback, (message) => {
                const data: WebsocketMessage = JSON.parse(message.data);
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

class WebsocketsServer {
    private roomId = window.sessionStorage.getItem(ROOM_ID_KEY)!;
    private connection: WebSocket | null = null;
    private started = false;

    public constructor() {
        if (!this.roomId) {
            this.roomId = v4();
        }
    }

    public start = () => {
        if (this.started) return;
        this.started = true;
        console.log('connection started');
        window.sessionStorage.setItem(ROOM_ID_KEY, this.roomId);

        this.connection = new WebSocket(WEBSOCKETS_SERVER);
        this.connection.onopen = () => {
            this.connection?.send(JSON.stringify({ t: 'register-room', id: this.roomId }));

            this.connection?.addEventListener('message', (message) => {
                try {
                    const payload: WebsocketMessage = JSON.parse(message.data);

                    // @ts-ignore
                    if (!['ping', 'pong', 'freq'].includes(payload?.payload?.t)) console.log('received', payload);

                    if (payload.t === 'forward') {
                        const { sender, payload: data } = payload;
                        const conn = new SenderWrapper(sender, this.connection!);

                        const type = data.t;
                        if (type === 'register') {
                            // @ts-ignore
                            RemoteMicManager.addRemoteMic(data.id, data.name, conn, data.silent);
                        } else if (type === 'unregister') {
                            RemoteMicManager.removeRemoteMic(sender, true);
                        } else if (type === 'subscribe-event') {
                            RemoteMicManager.addSubscription(sender, data.channel);
                        } else if (type === 'unsubscribe-event') {
                            RemoteMicManager.removeSubscription(sender, data.channel);
                        } else if (type === 'ping') {
                            conn.send({ t: 'pong' } as WebRTCEvents);
                        } else if (type === 'pong') {
                            RemoteMicManager.getRemoteMicById(sender)?.onPong();
                        } else if (type === 'request-songlist') {
                            Promise.all([SongDao.getLocalIndex(), SongDao.getDeletedSongsList()]).then(
                                ([custom, deleted]) => {
                                    // @ts-ignore
                                    sendEvent<WebRTCSongListEvent>(conn, 'songlist', {
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
                        } else if (RemoteMicManager.getPermission(conn.peer) === 'write') {
                            if (type === 'keystroke') {
                                events.remoteKeyboardPressed.dispatch(data.key);
                            } else if (type === 'search-song') {
                                events.remoteSongSearch.dispatch(data.search);
                            } else if (type === 'request-mic-select') {
                                events.playerChangeRequested.dispatch(data.id, data.playerNumber);
                            }
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            });
        };

        this.connection.onclose = () => {
            this.started = false;
        };
    };

    public getRoomId = () => this.roomId;
}

export default new WebsocketsServer();
