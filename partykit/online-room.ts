import type * as Party from 'partykit/server';
import { ONLINE_ROOM_TTL_MS } from '~/modules/online/protocol/consts';
import { OnlinePersistedState, OnlineRoomLogic } from '~/modules/online/protocol/room-logic';
import { OnlineMessages, OnlineSubscriptionChannels } from '~/modules/online/protocol/types';
import { RpcServer } from '~/modules/remote-mic/network/rpc/rpc-server';

const STATE_KEY = 'online-room-state';

/**
 * Authoritative online-mode room. One instance per room code. Standalone PartyKit project —
 * deployed separately from the remote-mic PartyKit server and from the Cloudflare Worker
 * (exposed via VITE_APP_ONLINE_PARTYKIT_URL).
 *
 * The wire protocol is JSON-encoded OnlineMessages; the connection id (PartySocket `_pk`
 * query param) doubles as the stable participant id.
 */
export default class OnlineRoomServer implements Party.Server {
  private logic: OnlineRoomLogic;
  private rpcServer: RpcServer<ReturnType<OnlineRoomLogic['createHandlers']>> | null = null;
  private subscriptions = new Map<string, Set<string>>();
  private channelLastValues = new Map<string, unknown>();

  constructor(readonly room: Party.Room) {
    this.logic = this.createLogic();
  }

  private createLogic = (restoreFrom?: OnlinePersistedState) =>
    new OnlineRoomLogic(
      {
        roomCode: this.room.id,
        now: () => Date.now(),
        publish: (channel, data) => {
          this.channelLastValues.set(channel, data);
          const subscribers = this.subscriptions.get(channel);
          if (!subscribers?.size) return;
          const message = JSON.stringify({ t: 'rpc-pub', channel, data });
          for (const connection of this.room.getConnections()) {
            if (subscribers.has(connection.id)) {
              connection.send(message);
            }
          }
        },
        persist: (state) => {
          void this.room.storage.put(STATE_KEY, state);
        },
        scheduleTtl: (deadline) => {
          void this.room.storage.setAlarm(deadline);
        },
        disconnect: (participantId) => {
          for (const connection of this.room.getConnections()) {
            if (this.participantIdOf(connection) === participantId) {
              connection.close(4001, 'removed');
            }
          }
        },
      },
      restoreFrom,
    );

  async onStart() {
    const persisted = await this.room.storage.get<OnlinePersistedState>(STATE_KEY);
    if (persisted) {
      this.logic = this.createLogic(persisted);
    }
    this.rpcServer = new RpcServer(
      this.logic.createHandlers(),
      () => 'write',
      () => {
        // publishing goes through logic deps directly; RpcServer.publish is unused here
      },
      (peerId) => {
        for (const connection of this.room.getConnections()) {
          if (this.participantIdOf(connection) === peerId) {
            connection.close(4001, 'removed');
          }
        }
      },
    );
  }

  /** Lets clients check whether a room code was actually opened before joining it. */
  onRequest() {
    // The game runs on a different origin than the PartyKit deployment
    return Response.json({ created: this.logic.isCreated() }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    const name = url.searchParams.get('name') ?? '';
    const create = url.searchParams.get('create') === '1';
    // The participant id travels separately from the connection id: connection ids are unique
    // per socket, so a stale socket of the same participant closing (quick refresh, React
    // StrictMode double-mount) cannot evict a fresh connection.
    const participantId = url.searchParams.get('pid') ?? connection.id;
    connection.setState({ participantId });
    const result = this.logic.handleConnect(participantId, name, { create });
    if (!result.accepted) {
      connection.send(JSON.stringify({ t: 'join-rejected', reason: result.reason }));
      connection.close(4000, result.reason);
      return;
    }
    connection.send(JSON.stringify({ t: 'joined', state: this.logic.getState() }));
  }

  private participantIdOf = (connection: Party.Connection): string =>
    (connection.state as { participantId?: string } | null)?.participantId ?? connection.id;

  async onMessage(raw: string | ArrayBuffer | ArrayBufferView, sender: Party.Connection) {
    if (typeof raw !== 'string') return;
    let message: OnlineMessages;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }

    const reply = (payload: unknown) => sender.send(JSON.stringify(payload));

    if (message.t === 'ping') {
      reply({ t: 'pong' });
    } else if (message.t === 'rpc-sub') {
      const channel = message.channel as string;
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, new Set());
      }
      this.subscriptions.get(channel)!.add(sender.id);
      // Replay the latest value so new subscribers get the current state immediately
      if (this.channelLastValues.has(channel)) {
        reply({ t: 'rpc-pub', channel, data: this.channelLastValues.get(channel) });
      } else if (channel === ('room-state' satisfies keyof OnlineSubscriptionChannels)) {
        reply({ t: 'rpc-pub', channel, data: this.logic.getState() });
      } else if (channel === ('song-preview' satisfies keyof OnlineSubscriptionChannels)) {
        reply({ t: 'rpc-pub', channel, data: this.logic.getChartPreview() });
      }
    } else if (message.t === 'rpc-unsub') {
      this.subscriptions.get(message.channel as string)?.delete(sender.id);
    } else if (message.t === 'rpc') {
      await this.rpcServer?.handleMessage(message, {
        peer: this.participantIdOf(sender),
        send: reply,
      });
    }
  }

  onClose(connection: Party.Connection) {
    this.subscriptions.forEach((subscribers) => subscribers.delete(connection.id));
    const participantId = this.participantIdOf(connection);
    // Only a participant's last socket closing counts as a disconnect
    const hasOtherLiveConnection = [...this.room.getConnections()].some(
      (other) => other !== connection && other.id !== connection.id && this.participantIdOf(other) === participantId,
    );
    if (!hasOtherLiveConnection) {
      this.logic.handleDisconnect(participantId);
    }
  }

  onError(connection: Party.Connection) {
    this.onClose(connection);
  }

  async onAlarm() {
    const persisted = await this.room.storage.get<OnlinePersistedState>(STATE_KEY);
    if (!persisted) return;
    const expired = Date.now() - persisted.lastActivityAt >= ONLINE_ROOM_TTL_MS;
    if (expired) {
      await this.room.storage.deleteAll();
    } else {
      await this.room.storage.setAlarm(persisted.lastActivityAt + ONLINE_ROOM_TTL_MS);
    }
  }
}
