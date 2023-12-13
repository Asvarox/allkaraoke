import events from 'GameEvents/GameEvents';
import { ServerTransport } from 'RemoteMic/Network/Server/Transport/interface';
import { NetworkMessages } from 'RemoteMic/Network/messages';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import { InputLagSetting } from 'Scenes/Settings/SettingsState';
import SongDao from 'Songs/SongsService';

const ROOM_ID_KEY = 'room_id_key';

export class NetworkServer {
  private roomId = window.sessionStorage.getItem(ROOM_ID_KEY)!;
  private started = false;
  public transportName: string;

  public constructor(private transport: ServerTransport) {
    if (!this.roomId) {
      this.roomId = '';
      for (let i = 0; i < 5; i++) {
        this.roomId += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
      }
    }
    this.transportName = transport.name;

    window.addEventListener('beforeunload', () => {
      RemoteMicManager.getRemoteMics().forEach((remoteMic) => remoteMic.connection.close());
      this.transport?.disconnect();
    });
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
            RemoteMicManager.addRemoteMic(event.id, event.name, sender, event.silent);
          } else if (type === 'unregister') {
            RemoteMicManager.removeRemoteMic(sender.peer, true);
          } else if (type === 'subscribe-event') {
            RemoteMicManager.addSubscription(sender.peer, event.channel);
          } else if (type === 'unsubscribe-event') {
            RemoteMicManager.removeSubscription(sender.peer, event.channel);
          } else if (type === 'ping') {
            sender.send({ t: 'pong' } as NetworkMessages);
          } else if (type === 'pong') {
            RemoteMicManager.getRemoteMicById(sender.peer)?.onPong();
          } else if (type === 'request-songlist') {
            Promise.all([SongDao.getLocalIndex(), SongDao.getDeletedSongsList()]).then(([custom, deleted]) => {
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
            });
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
