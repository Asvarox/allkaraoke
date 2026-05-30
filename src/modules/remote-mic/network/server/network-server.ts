import events from '~/modules/game-events/game-events';
import { ChannelName } from '~/modules/remote-mic/network/client/subscriptions';
import { NetworkMessages } from '~/modules/remote-mic/network/messages';
import { RpcServer } from '~/modules/remote-mic/network/rpc/rpc-server';
import { ServerTransport } from '~/modules/remote-mic/network/server/transport/interface';
import { PartyKitServerTransport } from '~/modules/remote-mic/network/server/transport/party-kit-server';
import { WebSocketServerTransport } from '~/modules/remote-mic/network/server/transport/web-socket-server';
import RemoteMicManager from '~/modules/remote-mic/remote-mic-manager';
import storage from '~/modules/utils/storage';
import { RemoteMicConnectionTypeSetting } from '~/routes/settings/settings-state';
import { serverHandlers } from './server-handlers';

export const GAME_CODE_KEY = 'room_id_key';
export const GAME_CODE_LENGTH = 5;

export const storeGameCode = (gameCode: string) => {
  storage.session.setItem(GAME_CODE_KEY, gameCode);
};

export class NetworkServer {
  private gameCode = storage.session.getItem(GAME_CODE_KEY)!;
  private started = false;
  private transport: ServerTransport | undefined;

  private rpcServer = new RpcServer(
    serverHandlers,
    (peerId) => RemoteMicManager.getPermission(peerId),
    (channel, message) => RemoteMicManager.broadcastToChannel(channel as ChannelName, message),
    (peerId) => this.transport?.removePlayer(peerId),
  );

  // Stores the most-recently published value per channel so newly subscribing clients
  // can receive the current state immediately without waiting for the next change.
  private channelLastValues: Record<string, unknown> = {};

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
            : new PartyKitServerTransport();
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
          } else if (type === 'rpc-sub') {
            RemoteMicManager.addSubscription(sender.peer, event.channel as ChannelName);
            // If there is a cached value for this channel, push it immediately to the new subscriber
            // so they don't have to wait for the next change to receive the current state.
            if (event.channel in this.channelLastValues) {
              sender.send({
                t: 'rpc-pub',
                channel: event.channel,
                data: this.channelLastValues[event.channel],
              } as NetworkMessages);
            }
          } else if (type === 'rpc-unsub') {
            RemoteMicManager.removeSubscription(sender.peer, event.channel as ChannelName);
          } else if (type === 'ping') {
            sender.send({ t: 'pong' } as NetworkMessages);
          } else if (type === 'pong') {
            RemoteMicManager.getRemoteMicById(sender.peer)?.onPong();
          } else if (type === 'rpc') {
            this.rpcServer.handleMessage(event, sender);
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

  // Publish data to all clients subscribed to a named channel
  public publish = (channel: string, data: unknown): void => {
    this.channelLastValues[channel] = data;
    this.rpcServer.publish(channel, data);
  };

  // Send a server-initiated call to every currently connected client
  public callAllClients = (method: string, ...args: unknown[]): void => {
    this.rpcServer.broadcastClientCall(RemoteMicManager.getRemoteMics(), method, ...args);
  };

  // Send a server-initiated call to a single connected client
  public callClient = (micId: string, method: string, ...args: unknown[]): void => {
    const mic = RemoteMicManager.getRemoteMicById(micId);
    if (mic) {
      this.rpcServer.callClient(mic.connection, method, ...args);
    }
  };

  public getGameCode = (): string => {
    const type = RemoteMicConnectionTypeSetting.get();
    return (type === 'WebSockets' ? 'w' : type === 'PartyKit' ? 'k' : 'p') + this.gameCode;
  };
}
