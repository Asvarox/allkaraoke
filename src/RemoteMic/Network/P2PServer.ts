import events from 'GameEvents/GameEvents';
import { WebRTCEvents, WebRTCSongListEvent } from 'RemoteMic/Network/events';
import sendEvent from 'RemoteMic/Network/sendEvent';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import SongDao from 'Songs/SongDao';
import { Peer } from 'peerjs';
import peerJSOptions from 'utils/peerJSOptions';
import { v4 } from 'uuid';

const ROOM_ID_KEY = 'room_id_key';

export class P2PServer {
    private roomId = window.sessionStorage.getItem(ROOM_ID_KEY)!;
    private peer: Peer | null = null;
    private started = false;

    public constructor() {
        if (!this.roomId) {
            this.roomId = v4();
        }

        window.addEventListener('beforeunload', () => {
            RemoteMicManager.getRemoteMics().forEach((remoteMic) => remoteMic.connection.close());
            this.peer?.disconnect();
        });
    }

    public start = () => {
        if (this.started) return;
        this.started = true;
        console.log('connection started');
        window.sessionStorage.setItem(ROOM_ID_KEY, this.roomId);

        this.peer = new Peer(this.roomId, peerJSOptions);

        this.peer.on('open', function (id) {
            console.log('My peer ID is: ' + id);
        });

        this.peer.on('connection', (conn) => {
            conn.on('data', (data: WebRTCEvents) => {
                const type = data.t;
                if (type === 'register') {
                    RemoteMicManager.addRemoteMic(data.id, data.name, conn, data.silent);
                } else if (type === 'unregister') {
                    RemoteMicManager.removeRemoteMic(conn.peer, true);
                } else if (type === 'subscribe-event') {
                    RemoteMicManager.addSubscription(conn.peer, data.channel);
                } else if (type === 'unsubscribe-event') {
                    RemoteMicManager.removeSubscription(conn.peer, data.channel);
                } else if (type === 'ping') {
                    conn.send({ t: 'pong' } as WebRTCEvents);
                } else if (type === 'pong') {
                    RemoteMicManager.getRemoteMicById(conn.peer)?.onPong();
                } else if (type === 'request-songlist') {
                    Promise.all([SongDao.getLocalIndex(), SongDao.getDeletedSongsList()]).then(([custom, deleted]) => {
                        sendEvent<WebRTCSongListEvent>(conn, 'songlist', {
                            custom: custom.map((song) => ({
                                artist: song.artist,
                                title: song.title,
                                video: song.video,
                                language: song.language,
                            })),
                            deleted,
                        });
                    });
                } else if (RemoteMicManager.getPermission(conn.peer) === 'write') {
                    if (type === 'keystroke') {
                        events.remoteKeyboardPressed.dispatch(data.key);
                    } else if (type === 'search-song') {
                        events.remoteSongSearch.dispatch(data.search);
                    } else if (type === 'request-mic-select') {
                        events.playerChangeRequested.dispatch(data.id, data.playerNumber);
                    }
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
                    RemoteMicManager.removeRemoteMic(conn.peer);
                }
            });

            conn.on('close', () => {
                RemoteMicManager.removeRemoteMic(conn.peer);
            });
        });
        this.peer.on('close', () => {
            this.started = false;
        });
    };

    public getRoomId = () => this.roomId;
}
