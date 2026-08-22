import type * as Party from 'partykit/server';

import { RpcServer } from '~/modules/network/rpc/rpc-server';
import { ServerSubscriptionRegistry } from '~/modules/network/rpc/server-subscription-registry';
import { ONLINE_MAX_NAME_LENGTH } from '~/modules/online/protocol/consts';
import { OnlinePersistedState, OnlineRoomLogic } from '~/modules/online/protocol/room-logic';
import { OnlineMessages, OnlineSubscriptionChannels } from '~/modules/online/protocol/types';

const STATE_KEY = 'online-room-state';

/** Persisted on `connection.state` (survives hibernation) so subscriptions can be rebuilt in
 * `onStart` — the in-memory `ServerSubscriptionRegistry` is lost every time the party hibernates
 * and wakes for a new message. */
type OnlineConnectionState = {
  participantId?: string;
  channels?: (keyof OnlineSubscriptionChannels)[];
};

/**
 * Authoritative online-mode room. One instance per room code. Standalone PartyKit project —
 * deployed separately from the remote-mic PartyKit server and from the Cloudflare Worker
 * (exposed via VITE_APP_ONLINE_PARTYKIT_URL).
 *
 * The wire protocol is JSON-encoded OnlineMessages; the connection id (PartySocket `_pk`
 * query param) doubles as the stable participant id.
 */
export default class OnlineRoomServer implements Party.Server {
  options: Party.ServerOptions = { hibernate: true };

  private logic: OnlineRoomLogic;
  private rpcServer: RpcServer<ReturnType<OnlineRoomLogic['createHandlers']>> | null = null;
  /** `onStart` runs once per wake, but `onAlarm` is not covered by it — PartyKit only promises
   * `onStart` before the first `onConnect`/`onRequest`. Both go through here so an alarm that wakes
   * a hibernated room still gets restored state and a rebuilt subscription registry to publish to. */
  private started: Promise<void> | null = null;
  private subscriptions = new ServerSubscriptionRegistry<OnlineSubscriptionChannels>({
    // Both channels have a current value even before anything is published, so a peer subscribing
    // right after joining doesn't have to wait for the next change
    fallbacks: {
      'room-state': () => this.logic.getState(),
      'song-preview': () => this.logic.getChartPreview(),
    },
  });

  constructor(readonly room: Party.Room) {
    this.logic = this.createLogic();
  }

  private createLogic = (restoreFrom?: OnlinePersistedState, liveParticipantIds?: ReadonlySet<string>) =>
    new OnlineRoomLogic(
      {
        // `Party.id` is not readable in an alarm context, so a restored room prefers the code from
        // its own snapshot and only falls back to the room's id on a first (non-restored) start.
        roomCode: restoreFrom?.roomCode ?? this.room.id,
        now: () => Date.now(),
        publish: (channel, data) => {
          this.subscriptions.publish(
            channel,
            data as OnlineSubscriptionChannels[keyof OnlineSubscriptionChannels],
            (connectionId, message) => this.room.getConnection(connectionId)?.send(JSON.stringify(message)),
          );
        },
        persist: (state) => {
          this.room.storage.put(STATE_KEY, state).catch((error) => {
            console.error('Failed to persist online room state', error);
          });
        },
        scheduleWake: (deadline) => {
          const armed = deadline === null ? this.room.storage.deleteAlarm() : this.room.storage.setAlarm(deadline);
          armed.catch((error) => {
            console.error('Failed to arm online room alarm', error);
          });
        },
        destroy: () => {
          this.room.storage.deleteAll().catch((error) => {
            console.error('Failed to wipe expired online room', error);
          });
        },
        disconnect: (participantId) => {
          for (const connection of this.room.getConnections<OnlineConnectionState>()) {
            if (this.participantIdOf(connection) === participantId) {
              connection.close(4001, 'removed');
            }
          }
        },
      },
      restoreFrom,
      liveParticipantIds,
    );

  onStart() {
    return this.ensureStarted();
  }

  private ensureStarted = () => (this.started ??= this.start());

  private async start() {
    const persisted = await this.room.storage.get<OnlinePersistedState>(STATE_KEY);
    if (persisted) {
      // Sockets that are still attached right now — tells OnlineRoomLogic's constructor whether
      // this is a hibernation wake (some of these were already in `persisted.participants`) or a
      // genuine restart (none were).
      const liveParticipantIds = new Set(
        [...this.room.getConnections<OnlineConnectionState>()].map((connection) => this.participantIdOf(connection)),
      );
      this.logic = this.createLogic(persisted, liveParticipantIds);
    }
    // Hibernation drops the in-memory subscription registry between messages; connections
    // themselves survive it, so rebuild the registry from each connection's persisted state.
    for (const connection of this.room.getConnections<OnlineConnectionState>()) {
      for (const channel of connection.state?.channels ?? []) {
        this.subscriptions.subscribe(connection.id, channel);
      }
    }
    this.rpcServer = new RpcServer(
      this.logic.createHandlers(),
      () => 'write',
      () => {
        // publishing goes through logic deps directly; RpcServer.publish is unused here
      },
      (peerId) => {
        for (const connection of this.room.getConnections<OnlineConnectionState>()) {
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

  onConnect(connection: Party.Connection<OnlineConnectionState>, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    // Bound the URL-derived name before it enters room state — a query param is attacker-controlled
    // and would otherwise bypass the length limit `room.setName` enforces.
    const name = (url.searchParams.get('name') ?? '').slice(0, ONLINE_MAX_NAME_LENGTH);
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

  private participantIdOf = (connection: Party.Connection<OnlineConnectionState>): string =>
    connection.state?.participantId ?? connection.id;

  async onMessage(raw: string | ArrayBuffer | ArrayBufferView, sender: Party.Connection<OnlineConnectionState>) {
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
      const channel = message.channel;
      this.subscriptions.subscribe(sender.id, channel);
      sender.setState((prev) => ({
        ...(prev ?? {}),
        channels: Array.from(new Set([...(prev?.channels ?? []), channel])),
      }));
      // Replay the latest value so new subscribers get the current state immediately
      const lastValue = this.subscriptions.getLastValue(channel);
      if (lastValue) {
        reply({ t: 'rpc-pub', channel, data: lastValue.data });
      }
    } else if (message.t === 'rpc-unsub') {
      this.subscriptions.unsubscribe(sender.id, message.channel);
      sender.setState((prev) => ({
        ...(prev ?? {}),
        channels: (prev?.channels ?? []).filter((channel) => channel !== message.channel),
      }));
    } else if (message.t === 'rpc') {
      await this.rpcServer?.handleMessage(message, {
        peer: this.participantIdOf(sender),
        send: reply,
      });
    }
  }

  onClose(connection: Party.Connection<OnlineConnectionState>) {
    this.subscriptions.removePeer(connection.id);
    const participantId = this.participantIdOf(connection);
    // Only a participant's last socket closing counts as a disconnect
    const hasOtherLiveConnection = [...this.room.getConnections<OnlineConnectionState>()].some(
      (other) => other !== connection && other.id !== connection.id && this.participantIdOf(other) === participantId,
    );
    if (!hasOtherLiveConnection) {
      this.logic.handleDisconnect(participantId);
    }
  }

  onError(connection: Party.Connection<OnlineConnectionState>) {
    this.onClose(connection);
  }

  /**
   * The only thing that wakes a room nobody is talking to. Clients in the lobby stop pinging and
   * reporting once they go idle, so without this a reconnect grace window armed just before the
   * party hibernated would never expire — the disconnected singer would keep their slot, and
   * possibly the host role, forever.
   */
  async onAlarm() {
    await this.ensureStarted();
    this.logic.handleAlarm();
  }
}
