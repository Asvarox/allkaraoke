import { DurableObject } from 'cloudflare:workers';

import { RpcServer } from '../src/modules/network/rpc/rpc-server';
import { ServerSubscriptionRegistry } from '../src/modules/network/rpc/server-subscription-registry';
// Relative imports on purpose: the `~` alias is only configured for the app build, not the Worker one
import { ONLINE_MAX_NAME_LENGTH } from '../src/modules/online/protocol/consts';
import { OnlinePersistedState, OnlineRoomLogic } from '../src/modules/online/protocol/room-logic';
import { OnlineMessages, OnlineSubscriptionChannels } from '../src/modules/online/protocol/types';

const STATE_KEY = 'online-room-state';

/**
 * Kept on each socket's attachment, which — unlike anything in memory — survives hibernation, so
 * the subscription registry can be rebuilt when the object wakes for the next message.
 */
interface SocketAttachment {
  /** Unique per socket. Two sockets of the same participant (a quick refresh, a StrictMode
   * double-mount) must be distinguishable, or the stale one closing would evict the fresh one. */
  socketId: string;
  participantId: string;
  channels: (keyof OnlineSubscriptionChannels)[];
}

/**
 * The server-authoritative online room: `OnlineRoomLogic` running on the server, with every client
 * on a WebSocket to it.
 *
 * This is the mode online mode shipped with, ported off PartyKit into the Worker this project
 * already owns — same logic, same wire protocol, one deployment instead of two. It is selected by
 * the `OnlineP2P` feature flag being off, and it is what P2P falls back to.
 *
 * It is also the expensive one, which is the point of the flag: Durable Objects bill on duration
 * and this object stays resident for the length of every song. Hibernation keeps an idle lobby
 * from being charged, but a room that is actually singing is awake throughout.
 */
export class OnlineRoom extends DurableObject {
  private logic!: OnlineRoomLogic;
  /**
   * The room's own code. A Durable Object cannot read the name it was addressed by, and the alarm
   * path has no request to take it from, so it arrives with the first connection and is persisted
   * with the rest of the state from then on. Read through a getter in the logic's deps rather than
   * captured by value: rebuilding the logic to set it would leave `rpcServer` bound to the old
   * instance, and every RPC would then be answered by a room with no participants in it.
   */
  private roomCode = '';
  private rpcServer!: RpcServer<ReturnType<OnlineRoomLogic['createHandlers']>>;
  private subscriptions = new ServerSubscriptionRegistry<OnlineSubscriptionChannels>({
    // Both channels have a current value even before anything is published, so a peer subscribing
    // right after joining doesn't have to wait for the next change
    fallbacks: {
      'room-state': () => this.logic.getState(),
      'song-preview': () => this.logic.getChartPreview(),
    },
  });

  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env as never);
    ctx.blockConcurrencyWhile(async () => {
      const persisted = await ctx.storage.get<OnlinePersistedState>(STATE_KEY);
      this.roomCode = persisted?.roomCode ?? '';
      // Sockets still attached right now tell OnlineRoomLogic whether this is a hibernation wake
      // (some of these were already participants) or a genuine restart (none were).
      const liveParticipantIds = new Set(this.attachments().map((attachment) => attachment.participantId));
      this.logic = this.createLogic(persisted, liveParticipantIds);

      // Hibernation drops the in-memory registry between messages; the sockets themselves survive,
      // so it is rebuilt from what each of them carries.
      for (const attachment of this.attachments()) {
        for (const channel of attachment.channels) {
          this.subscriptions.subscribe(attachment.socketId, channel);
        }
      }

      this.rpcServer = new RpcServer(
        this.logic.createHandlers(),
        () => 'write',
        () => {
          // publishing goes through the logic's deps directly; RpcServer.publish is unused here
        },
        (peerId) => this.closeSocketsOf(peerId),
      );
    });
  }

  private createLogic = (restoreFrom?: OnlinePersistedState, liveParticipantIds?: ReadonlySet<string>) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return new OnlineRoomLogic(
      {
        get roomCode() {
          return self.roomCode;
        },
        now: () => Date.now(),
        publish: (channel, data) => {
          this.subscriptions.publish(
            channel,
            data as OnlineSubscriptionChannels[keyof OnlineSubscriptionChannels],
            (socketId, message) => this.socketById(socketId)?.send(JSON.stringify(message)),
          );
        },
        persist: (state) => {
          this.ctx.storage.put(STATE_KEY, state).catch((error) => {
            console.error('Failed to persist online room state', error);
          });
        },
        scheduleWake: (deadline) => {
          const armed = deadline === null ? this.ctx.storage.deleteAlarm() : this.ctx.storage.setAlarm(deadline);
          armed.catch((error) => {
            console.error('Failed to arm online room alarm', error);
          });
        },
        destroy: () => {
          this.ctx.storage.deleteAll().catch((error) => {
            console.error('Failed to wipe expired online room', error);
          });
        },
        disconnect: (participantId) => this.closeSocketsOf(participantId),
      },
      restoreFrom,
      liveParticipantIds,
    );
  };

  private attachmentOf = (socket: WebSocket): SocketAttachment | null =>
    (socket.deserializeAttachment() as SocketAttachment | null) ?? null;

  private attachments = (): SocketAttachment[] =>
    this.ctx
      .getWebSockets()
      .map((socket) => this.attachmentOf(socket))
      .filter((attachment): attachment is SocketAttachment => attachment !== null);

  private socketById = (socketId: string): WebSocket | undefined =>
    this.ctx.getWebSockets().find((socket) => this.attachmentOf(socket)?.socketId === socketId);

  private closeSocketsOf = (participantId: string) => {
    for (const socket of this.ctx.getWebSockets()) {
      if (this.attachmentOf(socket)?.participantId === participantId) socket.close(4001, 'removed');
    }
  };

  /** Lets the join screen check a room code was actually opened before joining it. */
  public isCreated(): boolean {
    return this.logic.isCreated();
  }

  /** The socket upgrade. A `fetch` rather than an RPC method because a 101 response carrying a
   * `webSocket` cannot cross the Durable Object RPC boundary. */
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Expected websocket', { status: 426 });

    const url = new URL(request.url);
    // Bounded before it enters room state — a query param is attacker-controlled and would
    // otherwise bypass the limit `setName` enforces.
    const name = (url.searchParams.get('name') ?? '').slice(0, ONLINE_MAX_NAME_LENGTH);
    const create = url.searchParams.get('create') === '1';
    const participantId = url.searchParams.get('pid');
    const roomCode = url.searchParams.get('code') ?? '';
    if (!participantId) return new Response('pid required', { status: 400 });

    if (!this.roomCode && roomCode) this.roomCode = roomCode;

    const pair = new WebSocketPair();
    const server = pair[1];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({
      socketId: crypto.randomUUID(),
      participantId,
      channels: [],
    } satisfies SocketAttachment);

    const result = this.logic.handleConnect(participantId, name, { create });
    if (!result.accepted) {
      server.send(JSON.stringify({ t: 'join-rejected', reason: result.reason }));
      server.close(4000, result.reason);
    } else {
      server.send(JSON.stringify({ t: 'joined', state: this.logic.getState() }));
    }

    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(socket: WebSocket, raw: string | ArrayBuffer) {
    if (typeof raw !== 'string') return;
    const attachment = this.attachmentOf(socket);
    if (!attachment) return;

    let message: OnlineMessages;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }

    const reply = (payload: unknown) => socket.send(JSON.stringify(payload));
    const remember = (channels: (keyof OnlineSubscriptionChannels)[]) =>
      socket.serializeAttachment({ ...attachment, channels } satisfies SocketAttachment);

    if (message.t === 'ping') {
      reply({ t: 'pong' });
    } else if (message.t === 'rpc-sub') {
      this.subscriptions.subscribe(attachment.socketId, message.channel);
      remember(Array.from(new Set([...attachment.channels, message.channel])));
      // Replay the latest value so new subscribers get the current state immediately
      const lastValue = this.subscriptions.getLastValue(message.channel);
      if (lastValue) reply({ t: 'rpc-pub', channel: message.channel, data: lastValue.data });
    } else if (message.t === 'rpc-unsub') {
      this.subscriptions.unsubscribe(attachment.socketId, message.channel);
      remember(attachment.channels.filter((channel) => channel !== message.channel));
    } else if (message.t === 'rpc') {
      await this.rpcServer.handleMessage(message, { peer: attachment.participantId, send: reply });
    }
  }

  async webSocketClose(socket: WebSocket) {
    const attachment = this.attachmentOf(socket);
    if (!attachment) return;
    this.subscriptions.removePeer(attachment.socketId);
    // Only a participant's last socket closing counts as a disconnect
    const hasOtherLiveSocket = this.ctx
      .getWebSockets()
      .some((other) => other !== socket && this.attachmentOf(other)?.participantId === attachment.participantId);
    if (!hasOtherLiveSocket) this.logic.handleDisconnect(attachment.participantId);
  }

  async webSocketError(socket: WebSocket) {
    await this.webSocketClose(socket);
  }

  /**
   * The only thing that wakes a room nobody is talking to. Clients in the lobby stop pinging and
   * reporting once they go idle, so without this a reconnect grace window armed just before the
   * object hibernated would never expire — the disconnected singer would keep their slot, and
   * possibly the host role, forever.
   */
  async alarm() {
    this.logic.handleAlarm();
  }
}
