import events from '~/modules/game-events/game-events';
import { RpcServer } from '~/modules/network/rpc/rpc-server';
import { ServerSubscriptionRegistry } from '~/modules/network/rpc/server-subscription-registry';
import { ChannelName, SubscriptionChannels } from '~/modules/remote-mic/network/client/subscriptions';
import { NetworkMessages } from '~/modules/remote-mic/network/messages';
import { ServerTransport } from '~/modules/remote-mic/network/server/transport/interface';
import { PartyKitServerTransport } from '~/modules/remote-mic/network/server/transport/party-kit-server';
import { WebSocketServerTransport } from '~/modules/remote-mic/network/server/transport/web-socket-server';
import RemoteMicManager from '~/modules/remote-mic/remote-mic-manager';
import generateRoomCode from '~/modules/utils/generate-room-code';
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
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;

  private rpcServer = new RpcServer<typeof serverHandlers, SubscriptionChannels>(
    serverHandlers,
    (peerId) => RemoteMicManager.getPermission(peerId),
    (channel, message) => RemoteMicManager.broadcastToChannel(channel, message),
    (peerId) => this.transport?.removePlayer(peerId),
  );

  // Only the last-value cache half of the registry is used here: which mic is subscribed to what
  // lives in RemoteMicManager, which remembers it across a host reload and does the fan-out.
  private subscriptions = new ServerSubscriptionRegistry<SubscriptionChannels>();

  public constructor() {
    if (!this.gameCode) {
      // One character short of GAME_CODE_LENGTH: `getGameCode()` prepends the transport-type letter,
      // and that prefix has to fit within the length remote mics type in.
      this.gameCode = generateRoomCode(GAME_CODE_LENGTH - 1);
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

    const transport = this.transport;
    transport.connect(
      this.getGameCode(),
      () => {
        console.log('connected', this.getGameCode());
        transport.addListener((event, sender) => {
          const type = event.t;

          if (type === 'register') {
            RemoteMicManager.addRemoteMic(event.id, event.name, sender, event.silent, event.lag);
          } else if (type === 'unregister') {
            RemoteMicManager.removeRemoteMic(sender.peer);
          } else if (type === 'rpc-sub') {
            RemoteMicManager.addSubscription(sender.peer, event.channel);
            // If there is a cached value for this channel, push it immediately to the new subscriber
            // so they don't have to wait for the next change to receive the current state.
            const lastValue = this.subscriptions.getLastValue(event.channel);
            if (lastValue) {
              sender.send({
                t: 'rpc-pub',
                channel: event.channel,
                data: lastValue.data,
              } as NetworkMessages);
            }
          } else if (type === 'rpc-unsub') {
            RemoteMicManager.removeSubscription(sender.peer, event.channel);
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
        // Closed on purpose by `stop()` — it has already reported the server as stopped
        if (this.transport !== transport) return;
        events.micServerStopped.dispatch();
        this.started = false;

        // try to reconnect
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = undefined;
          this.start();
        }, 1_000);
      },
    );
  };

  /** Closes the server for good, dropping the phones connected to it. `start()` opens a new one. */
  public stop = () => {
    // A connection that dropped on its own has a reconnect queued, which would reopen the server
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
    const transport = this.transport;
    if (!transport) return;
    // Cleared first, so the transport's close callback doesn't schedule a reconnect
    this.transport = undefined;
    RemoteMicManager.getRemoteMics().forEach((remoteMic) => RemoteMicManager.removeRemoteMic(remoteMic.id, true));
    transport.disconnect();
    if (this.started) {
      this.started = false;
      events.micServerStopped.dispatch();
    }
  };

  public isStarted = () => this.started;

  public getLatency = () => this.transport?.getCurrentPing() ?? 0;

  // Publish data to all clients subscribed to a named channel
  public publish = <C extends ChannelName>(channel: C, data: SubscriptionChannels[C]): void => {
    this.subscriptions.setLastValue(channel, data);
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
