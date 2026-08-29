import { RpcServer } from '~/modules/network/rpc/rpc-server';
import { ServerSubscriptionRegistry } from '~/modules/network/rpc/server-subscription-registry';
import { getCachedChartData } from '~/modules/online/client/chart-cache';
import { OnlinePeerSender, OnlineRoomChannels, SfuRoomMembership } from '~/modules/online/client/transport/interface';
import { LoopbackTransportPair } from '~/modules/online/client/transport/loopback-transport';
import {
  ONLINE_HOST_HEARTBEAT_MS,
  ONLINE_MAX_NAME_LENGTH,
  ONLINE_SNAPSHOT_BROADCAST_MS,
} from '~/modules/online/protocol/consts';
import { OnlinePersistedState, OnlineRoomLogic } from '~/modules/online/protocol/room-logic';
import { OnlineMessages, OnlineSubscriptionChannels } from '~/modules/online/protocol/types';
import { DIRECTORY_KEEPALIVE_MS } from '~/modules/online/signaling/protocol';

/** Everything the host has to hand a successor. `chartData` is stripped on the way out and
 * restored from the successor's own cache — see `chart-cache`. */
export type OnlineHostSnapshot = Omit<OnlinePersistedState, 'chartData'>;

const hostSnapshotKey = (roomCode: string) => `ONLINE_HOST_SNAPSHOT_${roomCode}`;

/**
 * Keeps the newest room snapshot this tab knows about, whether it made it or merely received it.
 *
 * The game is not a single-page app: lobby, song and results are separate page loads, so anything
 * held only in memory is gone several times per song — for the host *and* for every client in the
 * succession line. A client that navigated at exactly the wrong moment would otherwise take over
 * with nothing to restore and reset the room to an empty lobby.
 */
export const stashHostSnapshot = (roomCode: string, snapshot: OnlineHostSnapshot) => {
  try {
    global.sessionStorage.setItem(hostSnapshotKey(roomCode), JSON.stringify(snapshot));
  } catch {
    // A full or unavailable sessionStorage costs a room reset on the next navigation, which is no
    // worse than not trying.
  }
};

/** The newest snapshot this tab stashed for the room, if any. */
export const takeStashedHostSnapshot = (roomCode: string): OnlineHostSnapshot | null => {
  try {
    const stored = global.sessionStorage.getItem(hostSnapshotKey(roomCode));
    if (!stored) return null;
    global.sessionStorage.removeItem(hostSnapshotKey(roomCode));
    return JSON.parse(stored) as OnlineHostSnapshot;
  } catch {
    return null;
  }
};

interface OnlineRoomHostOptions {
  roomCode: string;
  participantId: string;
  connection: OnlineRoomChannels;
  membership: SfuRoomMembership;
  /** Present only on a takeover: the last snapshot this browser saw from the previous host. */
  restoreFrom?: OnlineHostSnapshot | null;
}

/**
 * The authoritative room, running in the host's own tab.
 *
 * This is `partykit/online-room.ts` with the server taken out. `OnlineRoomLogic` is untouched and
 * still drives everything — only its environment changed: the Durable Object's alarm became a
 * `setTimeout`, its storage became a snapshot broadcast to the succession line, and its per-socket
 * fan-out became one publish on the SFU's broadcast channel.
 *
 * That last one is the point of the whole design. The old room paid for a server that stayed
 * resident for the length of every song; this one pays for bytes the SFU forwards, and the host's
 * uplink is flat no matter how many people are in the room.
 */
export class OnlineRoomHost {
  private readonly logic: OnlineRoomLogic;
  private readonly rpcServer: RpcServer<ReturnType<OnlineRoomLogic['createHandlers']>>;
  private readonly subscriptions: ServerSubscriptionRegistry<OnlineSubscriptionChannels>;

  /** Which participant owns which slot. The SFU tells us the slot a frame came in on and nothing
   * else, so this is populated by each peer's `hello` and is the only link between the two. */
  private readonly slotToParticipant = new Map<number, string>();
  private readonly participantToSlot = new Map<string, number>();

  private readonly loopback: LoopbackTransportPair;
  private readonly timers: ReturnType<typeof setTimeout>[] = [];
  private wakeTimer: ReturnType<typeof setTimeout> | null = null;
  private lastSnapshot: OnlinePersistedState | null = null;
  private lastSnapshotBroadcastAt = 0;
  private closed = false;

  private readonly membership: SfuRoomMembership;
  private readonly connection: OnlineRoomChannels;
  private readonly participantId: string;
  private readonly roomCode: string;

  public constructor({ roomCode, participantId, connection, membership, restoreFrom }: OnlineRoomHostOptions) {
    this.connection = connection;
    this.membership = membership;
    this.participantId = participantId;
    this.roomCode = roomCode;
    this.loopback = new LoopbackTransportPair(participantId);

    // A takeover is exactly the case `OnlineRoomLogic` already calls a hibernation wake: the room
    // was running a moment ago and some of its participants never went anywhere. Handing it the
    // set of ids we still believe are here is what makes it resume the phase in progress rather
    // than dropping everyone back into the lobby.
    const restored: OnlinePersistedState | undefined = restoreFrom
      ? { ...restoreFrom, chartData: getCachedChartData(restoreFrom.chart ?? null) }
      : undefined;
    // The outgoing host is deliberately *not* counted as live, however the snapshot describes it:
    // a takeover only happens because that host stopped answering, but the last snapshot it sent
    // was taken while it was still fine and still says `connected: true`. Trusting that would
    // leave the room showing a singer who is gone, and — since the room logic elects the
    // earliest-joined connected participant — arguing about who is in charge.
    const liveParticipantIds = new Set(
      restored?.participants
        .filter((participant) => participant.connected && participant.id !== restored.hostId)
        .map((participant) => participant.id) ?? [],
    );

    this.subscriptions = new ServerSubscriptionRegistry<OnlineSubscriptionChannels>({
      fallbacks: {
        'room-state': () => this.logic.getState(),
        'song-preview': () => this.logic.getChartPreview(),
      },
    });

    this.logic = new OnlineRoomLogic(
      {
        roomCode,
        now: () => Date.now(),
        hostEpoch: () => this.membership.epoch,
        publish: (channel, data) => {
          // One send for the whole room. Subscription bookkeeping still decides what a *newly*
          // subscribing peer gets replayed, but the steady-state push goes to everyone and the
          // client-side manager drops channels it has no callbacks for — paying a few bytes per
          // singer to keep the host's uplink independent of the room size.
          this.subscriptions.setLastValue(channel, data as OnlineSubscriptionChannels[typeof channel]);
          this.broadcast({ t: 'rpc-pub', channel, data } as OnlineMessages);
        },
        persist: (state) => {
          this.lastSnapshot = state;
          this.broadcastSnapshot();
        },
        scheduleWake: (deadline) => this.scheduleWake(deadline),
        destroy: () => this.close(),
        disconnect: (id) => this.evictParticipant(id),
      },
      restored,
      liveParticipantIds,
    );

    this.rpcServer = new RpcServer(
      this.logic.createHandlers(),
      () => 'write',
      () => {
        // publishing goes through the logic's deps directly; RpcServer.publish is unused here
      },
      (peerId) => this.evictParticipant(peerId),
    );

    this.bindConnection();
    this.joinSelf();
    this.startLoops();
    this.keepAcrossNavigation();
  }

  /** The host's own client talks to the room through here — same RPC, no SFU round trip. */
  public getLoopbackTransport = () => this.loopback.transport;

  public getEpoch = () => this.membership.epoch;

  private bindConnection = () => {
    this.connection.onMessage((message, slot) => {
      if (slot === null) return; // the host never reads its own broadcast
      void this.handleMessage(message, slot);
    });
    this.connection.onSlotClosed((slot) => {
      const participantId = this.slotToParticipant.get(slot);
      if (participantId) this.logic.handleDisconnect(participantId);
    });
    this.loopback.addHostListener((message, sender) => {
      void this.handleFromSender(message, sender);
    });
  };

  /** The host is a participant like anyone else — it just joins over the loopback. */
  private joinSelf = () => {
    const result = this.logic.handleConnect(this.participantId, '', { create: true });
    if (result.accepted) {
      this.loopback.peer.send({ t: 'joined', state: this.logic.getState() } as never);
    }
  };

  private senderForSlot = (slot: number): OnlinePeerSender => ({
    peer: this.slotToParticipant.get(slot) ?? `slot:${slot}`,
    send: (payload) => this.connection.sendToSlot(slot, payload as OnlineMessages),
  });

  private handleMessage = async (message: OnlineMessages, slot: number) => {
    if (message.t === 'hello') {
      this.handleHello(message.participantId, message.name, message.create, slot);
      return;
    }
    await this.handleFromSender(message, this.senderForSlot(slot));
  };

  private handleHello = (participantId: string, name: string, create: boolean, slot: number) => {
    // The name arrives from a client and goes straight into room state, so it is bounded here the
    // same way the PartyKit server bounded the one it read off the connection URL.
    const boundedName = (name ?? '').slice(0, ONLINE_MAX_NAME_LENGTH);
    const sender = {
      peer: participantId,
      send: (payload: unknown) => this.connection.sendToSlot(slot, payload as OnlineMessages),
    };

    const result = this.logic.handleConnect(participantId, boundedName, { create });
    if (!result.accepted) {
      sender.send({ t: 'join-rejected', reason: result.reason });
      return;
    }

    // Only bind the slot once the join is accepted — a rejected peer must not be able to claim a
    // slot's identity and start issuing RPCs as whoever it named itself.
    this.slotToParticipant.set(slot, participantId);
    this.participantToSlot.set(participantId, slot);
    sender.send({ t: 'joined', state: this.logic.getState() });
  };

  private handleFromSender = async (message: OnlineMessages, sender: OnlinePeerSender) => {
    if (message.t === 'ping') {
      sender.send({ t: 'pong' });
      return;
    }
    if (message.t === 'rpc-sub') {
      this.subscriptions.subscribe(sender.peer, message.channel);
      // Replay the current value so a new subscriber does not wait for the next change
      const lastValue = this.subscriptions.getLastValue(message.channel);
      if (lastValue) sender.send({ t: 'rpc-pub', channel: message.channel, data: lastValue.data });
      return;
    }
    if (message.t === 'rpc-unsub') {
      this.subscriptions.unsubscribe(sender.peer, message.channel);
      return;
    }
    if (message.t === 'rpc') {
      await this.rpcServer.handleMessage(message, sender);
    }
  };

  private broadcast = (message: OnlineMessages) => {
    if (this.closed) return;
    this.connection.broadcast(message);
    // The host's own client is not an SFU subscriber, so it is fanned out to separately.
    this.loopback.peer.send(message);
  };

  /**
   * Throws someone out for good — a kick. They are told before their slot goes, because nothing
   * else would tell them: the old server closed their socket with a status code, and over the SFU
   * there is no equivalent gesture. Without this a kicked singer sits in a room that has forgotten
   * them, seeing neither the lobby nor a rejection.
   */
  private evictParticipant = (participantId: string) => {
    const slot = this.participantToSlot.get(participantId);
    if (slot !== undefined) this.connection.sendToSlot(slot, { t: 'join-rejected', reason: 'banned' } as never);
    this.dropParticipant(participantId, { ban: true });
  };

  private dropParticipant = (participantId: string, { ban = false } = {}) => {
    const slot = this.participantToSlot.get(participantId);
    if (slot !== undefined) {
      this.slotToParticipant.delete(slot);
      this.participantToSlot.delete(participantId);
    }
    this.subscriptions.removePeer(participantId);
    // Frees *their* slot in the directory so somebody else can take it. Fire-and-forget: the room
    // has already stopped talking to them either way.
    // Banning at the directory as well as in the room logic: the logic's ban list lives in this
    // tab, and a kicked singer could otherwise re-claim a slot and keep reading the broadcast.
    void this.connection.releaseSlot(participantId, ban);
  };

  /**
   * Releases slots the room logic has finished with. A participant whose reconnect grace window
   * expires is dropped inside the logic, which has no way to reach the directory — so without this
   * their slot would stay claimed and a busy room would start turning people away with seats free.
   * Runs on the snapshot tick because it is cheap and needs no timer of its own.
   */
  private reconcileSlots = () => {
    const present = new Set(this.logic.getState().participants.map((participant) => participant.id));
    for (const participantId of [...this.participantToSlot.keys()]) {
      if (!present.has(participantId)) this.dropParticipant(participantId);
    }
  };

  /** Replaces the Durable Object's alarm. Timer throttling in a background tab is exactly why the
   * clients run a heartbeat watchdog — a host that cannot fire this on time gets replaced. */
  private scheduleWake = (deadline: number | null) => {
    if (this.wakeTimer) clearTimeout(this.wakeTimer);
    this.wakeTimer = null;
    if (deadline === null || this.closed) return;
    this.wakeTimer = setTimeout(
      () => {
        this.wakeTimer = null;
        this.logic.handleAlarm();
      },
      Math.max(0, deadline - Date.now()),
    );
  };

  private startLoops = () => {
    this.timers.push(
      setInterval(() => {
        this.broadcast({ t: 'hb', epoch: this.membership.epoch });
        // Piggy-backed on the heartbeat rather than given its own timer. The room logic publishes
        // state on transitions, and a song is one long stretch without any — so the persist-driven
        // path alone would leave the succession line holding a snapshot from before the song
        // started. Still rate-limited to ONLINE_SNAPSHOT_BROADCAST_MS inside broadcastSnapshot.
        this.broadcastSnapshot();
      }, ONLINE_HOST_HEARTBEAT_MS),
      // Without this the directory's TTL would wipe a room out from under a long session, and the
      // next person to try the code would be told it does not exist.
      setInterval(() => void this.connection.keepalive(), DIRECTORY_KEEPALIVE_MS),
    );
  };

  /**
   * Hands the succession line the state it would need to take over.
   *
   * Driven by the room logic's own `persist` rather than by a timer: it then rides exactly the
   * same path as the state pushes clients already depend on, costs nothing while a room sits
   * still, and cannot drift out of step with the state it describes. The rate limit is a
   * timestamp rather than a scheduled flush for the same reason — the last snapshot before a host
   * disappears is worth more than an evenly spaced one.
   */
  private broadcastSnapshot = () => {
    const snapshot = this.lastSnapshot;
    if (!snapshot) return;
    const now = Date.now();
    if (now - this.lastSnapshotBroadcastAt < ONLINE_SNAPSHOT_BROADCAST_MS) return;
    this.lastSnapshotBroadcastAt = now;
    this.reconcileSlots();
    const { chartData: _chartData, ...withoutChart } = snapshot;
    this.broadcast({ t: 'snapshot', state: withoutChart satisfies OnlineHostSnapshot });
  };

  /**
   * Survives the host's own page navigations.
   *
   * The game is not a single-page app — moving between the lobby, the song and the results is a
   * real page load, which tears down the tab's JavaScript and with it the room running in it. On a
   * server that never mattered; with the authority in a browser it would reset the room several
   * times per song.
   *
   * So the snapshot is stashed in `sessionStorage` (per tab, cleared when it closes) on the way
   * out, and the reloaded page picks the room back up from it. Clients ride out the gap: a reload
   * is well inside ONLINE_HOST_STALL_MS, and if one is slow enough to trigger a promotion anyway
   * the returning host simply finds a newer epoch and follows it.
   */
  private keepAcrossNavigation = () => {
    // `pagehide` rather than `beforeunload`: it fires on the back/forward cache path too, and is
    // the one mobile Safari actually delivers.
    global.addEventListener('pagehide', this.stashSnapshot);
  };

  private stashSnapshot = () => {
    if (this.closed || !this.lastSnapshot) return;
    const { chartData: _chartData, ...withoutChart } = this.lastSnapshot;
    stashHostSnapshot(this.roomCode, withoutChart);
  };

  public close = () => {
    if (this.closed) return;
    this.closed = true;
    global.removeEventListener('pagehide', this.stashSnapshot);
    this.timers.forEach((timer) => clearInterval(timer));
    if (this.wakeTimer) clearTimeout(this.wakeTimer);
    this.loopback.close();
  };
}
