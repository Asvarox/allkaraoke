import { DurableObject } from 'cloudflare:workers';

// Relative import on purpose: the `~` alias is only configured for the app build, not the Worker one
import { DIRECTORY_TTL_MS, ONLINE_SLOT_COUNT } from '../src/modules/online/signaling/protocol';
import type {
  JoinRoomResponse,
  OnlineDataPlane,
  PromoteHostResponse,
  RelayHostFrame,
  RelayInboundFrame,
  RoomInfoResponse,
} from '../src/modules/online/signaling/protocol';

/**
 * The one piece of server state online mode keeps: who is in a room, which slot channel each of
 * them owns, and who is currently hosting.
 *
 * Deliberately tiny and deliberately cold. It is touched on join, leave, host promotion and a
 * five-minute keepalive — never on the message path, which runs host-to-client over the SFU. That
 * is the whole point of the rewrite: the old room object stayed resident for the length of every
 * song, this one wakes for a millisecond a handful of times per room.
 *
 * Trust model matches what the PartyKit room already assumed: the participant id is whatever the
 * client says it is. A griefer who has the room code could evict somebody; the same was true
 * before, and the room logic's ban list is still the real defence.
 */

const STATE_KEY = 'directory';

interface Member {
  participantId: string;
  sessionId: string;
  slot: number;
}

interface DirectoryState {
  created: boolean;
  epoch: number;
  hostParticipantId: string | null;
  hostSessionId: string | null;
  members: Member[];
  lastActivityAt: number;
}

const emptyState = (now: number): DirectoryState => ({
  created: false,
  epoch: 0,
  hostParticipantId: null,
  hostSessionId: null,
  members: [],
  lastActivityAt: now,
});

export class OnlineDirectory extends DurableObject {
  private state: DirectoryState;

  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env as never);
    this.state = emptyState(Date.now());
    ctx.blockConcurrencyWhile(async () => {
      const stored = await ctx.storage.get<DirectoryState>(STATE_KEY);
      if (stored) this.state = stored;
    });
  }

  private async persist() {
    this.state.lastActivityAt = Date.now();
    await this.ctx.storage.put(STATE_KEY, this.state);
    // One alarm, always pushed out to the full TTL from the last thing that happened.
    await this.ctx.storage.setAlarm(this.state.lastActivityAt + DIRECTORY_TTL_MS);
  }

  private freeSlot(): number | null {
    const taken = new Set(this.state.members.map((member) => member.slot));
    for (let slot = 0; slot < ONLINE_SLOT_COUNT; slot++) {
      if (!taken.has(slot)) return slot;
    }
    return null;
  }

  /** Host is whoever the directory last promoted, falling back to the earliest remaining member so
   * a room whose host row was pruned still has one rather than going headless. */
  private electFallbackHost() {
    const stillHere = this.state.members.some((member) => member.participantId === this.state.hostParticipantId);
    if (stillHere) return;
    const next = this.state.members[0] ?? null;
    this.state.hostParticipantId = next?.participantId ?? null;
    this.state.hostSessionId = next?.sessionId ?? null;
    if (next) this.state.epoch += 1;
  }

  public info(dataPlane: OnlineDataPlane = 'sfu'): RoomInfoResponse {
    return {
      created: this.state.created,
      hostSessionId: this.state.hostSessionId,
      epoch: this.state.epoch,
      dataPlane,
    };
  }

  // --- fallback relay ---
  //
  // Only reachable when the Worker has no Realtime credentials: the end-to-end suite, and a local
  // checkout without a Cloudflare Realtime app. It forwards the same frames the SFU would, so
  // everything above `OnlineRoomChannels` — the room logic, the host runtime, slot binding, host
  // succession — is the production code path either way. What it costs is precisely what the SFU
  // was brought in to stop paying: this object stays resident for as long as anyone is singing.
  // The signaling layer is what keeps it out of production; see `handleOnlineSignaling`.

  private static readonly HOST_TAG = 'host';
  private static readonly slotTag = (slot: number) => `slot:${slot}`;

  /**
   * The relay's socket upgrade. This has to be `fetch` rather than an RPC method: a 101 response
   * carrying a `webSocket` cannot cross the RPC boundary, so the signaling layer forwards the
   * original request here instead.
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const role = url.searchParams.get('role') === 'host' ? 'host' : 'client';
    const slot = Number(url.searchParams.get('slot') ?? '0');
    if (!Number.isInteger(slot) || slot < 0 || slot >= ONLINE_SLOT_COUNT) {
      return new Response('invalid slot', { status: 400 });
    }

    const pair = new WebSocketPair();
    const tag = role === 'host' ? OnlineDirectory.HOST_TAG : OnlineDirectory.slotTag(slot);
    // Hibernatable, and tagged rather than held in a field — the tags survive an eviction, an
    // in-memory map would not.
    this.ctx.acceptWebSocket(pair[1], [tag]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(socket: WebSocket, raw: string | ArrayBuffer) {
    if (typeof raw !== 'string') return;
    const tags = this.ctx.getTags(socket);
    const isHost = tags.includes(OnlineDirectory.HOST_TAG);

    if (isHost) {
      let frame: RelayHostFrame;
      try {
        frame = JSON.parse(raw);
      } catch {
        return;
      }
      const payload = JSON.stringify(frame.message);
      const targets =
        frame.kind === 'broadcast'
          ? this.ctx
              .getWebSockets()
              .filter((candidate) => !this.ctx.getTags(candidate).includes(OnlineDirectory.HOST_TAG))
          : this.ctx.getWebSockets(OnlineDirectory.slotTag(frame.slot));
      targets.forEach((target) => target.send(payload));
      return;
    }

    const slotTag = tags.find((tag) => tag.startsWith('slot:'));
    if (!slotTag) return;
    const inbound: RelayInboundFrame = { slot: Number(slotTag.slice('slot:'.length)), message: JSON.parse(raw) };
    this.ctx.getWebSockets(OnlineDirectory.HOST_TAG).forEach((host) => host.send(JSON.stringify(inbound)));
  }

  async webSocketClose(socket: WebSocket) {
    const slotTag = this.ctx.getTags(socket).find((tag) => tag.startsWith('slot:'));
    if (!slotTag) return;
    // The host learns a singer is gone the way it would over the SFU: the pipe closed.
    const closed = JSON.stringify({ slot: Number(slotTag.slice('slot:'.length)), closed: true });
    this.ctx.getWebSockets(OnlineDirectory.HOST_TAG).forEach((host) => host.send(closed));
  }

  public async join(participantId: string, sessionId: string, create: boolean): Promise<JoinRoomResponse> {
    if (!this.state.created) {
      if (!create) return { ok: false, reason: 'not-found' };
      this.state.created = true;
    }

    // A rejoin (refresh, dropped connection, a fresh SFU session after a network flap) keeps the
    // slot it already owns — otherwise a reconnecting player would consume a second one and a full
    // room could never let anybody back in.
    const existing = this.state.members.find((member) => member.participantId === participantId);
    if (existing) {
      existing.sessionId = sessionId;
      if (this.state.hostParticipantId === participantId) {
        // The host came back on a new session: its published channels are gone with the old one,
        // so everyone has to re-subscribe. A new epoch is what tells them to.
        this.state.hostSessionId = sessionId;
        this.state.epoch += 1;
      }
    } else {
      const slot = this.freeSlot();
      if (slot === null) return { ok: false, reason: 'room-full' };
      this.state.members.push({ participantId, sessionId, slot });
    }

    if (this.state.hostParticipantId === null) {
      this.state.hostParticipantId = participantId;
      this.state.hostSessionId = sessionId;
      this.state.epoch += 1;
    }

    await this.persist();

    const member = this.state.members.find((entry) => entry.participantId === participantId)!;
    return {
      ok: true,
      isHost: this.state.hostParticipantId === participantId,
      hostSessionId: this.state.hostSessionId!,
      epoch: this.state.epoch,
      slot: member.slot,
    };
  }

  public async leave(participantId: string): Promise<void> {
    const before = this.state.members.length;
    this.state.members = this.state.members.filter((member) => member.participantId !== participantId);
    if (this.state.members.length === before) return;
    this.electFallbackHost();
    await this.persist();
  }

  /**
   * A client that watched the host go quiet takes over. `fromEpoch` is a compare-and-swap: two
   * clients noticing the same stall both call this, and only the first one to land wins. The loser
   * gets the winner's epoch back and follows it instead of starting a second room.
   */
  public async promote(participantId: string, sessionId: string, fromEpoch: number): Promise<PromoteHostResponse> {
    const member = this.state.members.find((entry) => entry.participantId === participantId);
    if (!member) {
      return { ok: false, reason: 'not-a-member', epoch: this.state.epoch, hostSessionId: this.state.hostSessionId };
    }
    if (fromEpoch !== this.state.epoch) {
      return { ok: false, reason: 'stale-epoch', epoch: this.state.epoch, hostSessionId: this.state.hostSessionId };
    }

    // The outgoing host keeps its membership: it may well still be there and merely throttled, and
    // dropping it would evict a player over a background tab. It just is not in charge any more.
    member.sessionId = sessionId;
    this.state.hostParticipantId = participantId;
    this.state.hostSessionId = sessionId;
    this.state.epoch += 1;
    await this.persist();
    return { ok: true, epoch: this.state.epoch };
  }

  /** Pushes the TTL out. Called by the host every DIRECTORY_KEEPALIVE_MS — without it a room that
   * outlives the TTL in one sitting would be wiped out from under its own players, and the next
   * person to try the code would be told it does not exist. */
  public async keepalive(): Promise<void> {
    await this.persist();
  }

  async alarm() {
    if (Date.now() - this.state.lastActivityAt < DIRECTORY_TTL_MS) {
      // Something touched the room after this alarm was armed — re-arm for the new deadline.
      await this.ctx.storage.setAlarm(this.state.lastActivityAt + DIRECTORY_TTL_MS);
      return;
    }
    await this.ctx.storage.deleteAll();
    this.state = emptyState(Date.now());
  }
}
