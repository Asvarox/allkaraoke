import events from 'modules/GameEvents/GameEvents';
import { PartyKitServerTransport } from 'modules/RemoteMic/Network/Server/Transport/PartyKitServer';
import { PeerJSServerTransport } from 'modules/RemoteMic/Network/Server/Transport/PeerJSServer';
import { WebSocketServerTransport } from 'modules/RemoteMic/Network/Server/Transport/WebSocketServer';
import { ServerTransport } from 'modules/RemoteMic/Network/Server/Transport/interface';
import { NetworkMessages } from 'modules/RemoteMic/Network/messages';
import RemoteMicManager from 'modules/RemoteMic/RemoteMicManager';
import SongDao from 'modules/Songs/SongsService';
import storage from 'modules/utils/storage';
import { InputLagSetting, RemoteMicConnectionTypeSetting } from 'routes/Settings/SettingsState';

export const GAME_CODE_KEY = 'room_id_key';
export const GAME_CODE_LENGTH = 5;

export const storeGameCode = (gameCode: string) => {
  storage.session.setItem(GAME_CODE_KEY, gameCode);
};

export class NetworkServer {
  private gameCode = storage.session.getItem(GAME_CODE_KEY)!;
  private started = false;
  private transport: ServerTransport | undefined;

  public constructor() {
    if (!this.gameCode) {
      this.gameCode = '';
      for (let i = 0; i < GAME_CODE_LENGTH - 1; i++) {
        this.gameCode += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
      }
    }

    global?.addEventListener?.('beforeunload', () => {
      RemoteMicManager.getRemoteMics().forEach((remoteMic) => remoteMic.connection.close());
      this.transport?.disconnect();
    });
  }

  public start = () => {
    if (!this.transport) {
      const type = RemoteMicConnectionTypeSetting.get();
      this.transport =
        type === 'WebSockets'
          ? new WebSocketServerTransport()
          : type === 'PartyKit'
            ? new PartyKitServerTransport()
            : new PeerJSServerTransport();
    }
    if (this.started) return;
    this.started = true;
    console.log('connection started', this.getGameCode());
    storeGameCode(this.gameCode);

    this.transport.connect(
      this.getGameCode(),
      () => {
        console.log('connected', this.getGameCode());
        this.transport!.addListener((event, sender) => {
          const type = event.t;
          if (type === 'register') {
            RemoteMicManager.addRemoteMic(event.id, event.name, sender, event.silent, event.lag);
          } else if (type === 'unregister') {
            RemoteMicManager.removeRemoteMic(sender.peer);
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
                  search: song.search,
                })),
                deleted,
              });
            });
          } else if (type === 'get-microphone-lag-request') {
            const microphone = RemoteMicManager.getRemoteMicById(sender.peer);
            if (microphone) {
              sender.send({ t: 'get-microphone-lag-response', value: microphone.getInput().getInputLag() });
            }
          } else if (type === 'set-microphone-lag-request') {
            const microphone = RemoteMicManager.getRemoteMicById(sender.peer);
            if (microphone) {
              microphone.getInput().setInputLag(event.value);
              sender.send({ t: 'get-microphone-lag-response', value: microphone.getInput().getInputLag() });
            }
          } else if (RemoteMicManager.getPermission(sender.peer) === 'write') {
            if (type === 'keystroke') {
              events.remoteKeyboardPressed.dispatch(event.key);
            } else if (type === 'search-song') {
              events.remoteSongSearch.dispatch(event.search);
            } else if (type === 'select-song') {
              events.remoteSongSelected.dispatch(event.id);
            } else if (type === 'request-mic-select') {
              events.playerChangeRequested.dispatch(event.id, event.playerNumber);
            } else if (type === 'get-game-input-lag-request') {
              sender.send({ t: 'get-game-input-lag-response', value: InputLagSetting.get() });
            } else if (type === 'set-game-input-lag-request') {
              InputLagSetting.set(event.value);
              sender.send({ t: 'get-game-input-lag-response', value: InputLagSetting.get() });
            }
          }
        });

        events.micServerStarted.dispatch();
      },
      () => {
        events.micServerStopped.dispatch();
        this.started = false;

        // try to reconnect
        setTimeout(this.start, 1_000);
      },
    );
  };

  public isStarted = () => this.started;

  public getLatency = () => this.transport?.getCurrentPing() ?? 0;

  public getGameCode = (): string => {
    const type = RemoteMicConnectionTypeSetting.get();
    return (type === 'WebSockets' ? 'w' : type === 'PartyKit' ? 'k' : 'p') + this.gameCode;
  };
}
