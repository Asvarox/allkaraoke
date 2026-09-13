import { DurableObject } from 'cloudflare:workers';

// Relative import on purpose: the `~` alias is only configured for the app build, not the Worker one
import { DIRECTORY_TTL_MS, ONLINE_SLOT_COUNT } from '../src/modules/online/signaling/protocol';
import type {
  ChannelAuthorization,
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
 * Trust model: a participant id proves nothing — it is published to the whole room in `room-state`,
 * so everybody who has ever been in a room knows everyone else's. What a membership is held by is
 * the secret minted here on its first join. Rejoining a membership or promoting it requires that
 * secret; removing somebody else requires being the current host. The room logic's ban list remains
 * the defence against a griefer who simply joins legitimately.
 */

const STATE_KEY = 'directory';

interface Member {
  participantId: string;
  sessionId: string;
  slot: number;
  /** Minted here on the first join and never published in room state. Everything that acts on an
   * existing membership — rejoining it, promoting it — has to present this, because the
   * participant id itself is broadcast to the whole room and proves nothing. */
  secret: string;
}

interface DirectoryState {
  created: boolean;
  bannedIds: string[];
  epoch: number;
  hostParticipantId: string | null;
  hostSessionId: string | null;
  members: Member[];
  lastActivityAt: number;
}

/**
 * Compares a membership secret against what a caller presented.
 *
 * A membership stored before secrets existed has none, and matches nothing — a room still running
 * across a deploy sends its singers back through a fresh join rather than leaving the old hole open
 * for the rest of its TTL. The comparison is length-checked first and then whole-string, so it does
 * not leak a matching prefix through an early return.
 */
const secretMatches = (stored: string | undefined, presented: string | undefined): boolean => {
  if (!stored || !presented || stored.length !== presented.length) return false;
  let difference = 0;
  for (let index = 0; index < stored.length; index++) {
    difference |= stored.charCodeAt(index) ^ presented.charCodeAt(index);
  }
  return difference === 0;
};

const emptyState = (now: number): DirectoryState => ({
  created: false,
  bannedIds: [],
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
  /** Who a socket belongs to. The role tags are fixed when a socket is accepted, so after a
   * promotion the outgoing host's socket still carries `host` — this is what tells the two apart. */
  private static readonly participantTag = (participantId: string) => `participant:${participantId}`;

  private isCurrentHostSocket(socket: WebSocket): boolean {
    const tags = this.ctx.getTags(socket);
    if (!tags.includes(OnlineDirectory.HOST_TAG)) return false;
    return (
      this.state.hostParticipantId !== null &&
      tags.includes(OnlineDirectory.participantTag(this.state.hostParticipantId))
    );
  }

  /** Whether anybody is currently holding the room's host socket, ignoring one that is on its way
   * out — `webSocketClose` runs while its own socket is still listed. */
  private hasLiveHostSocket(except?: WebSocket): boolean {
    return this.ctx
      .getWebSockets(OnlineDirectory.HOST_TAG)
      .some((socket) => socket !== except && this.isCurrentHostSocket(socket));
  }

  /**
   * The relay's socket upgrade. This has to be `fetch` rather than an RPC method: a 101 response
   * carrying a `webSocket` cannot cross the RPC boundary, so the signaling layer forwards the
   * original request here instead.
   *
   * Role and slot are derived from directory membership, never from the request. Taking them from
   * the query string would have let anyone holding a room code open a host-tagged socket and
   * broadcast to the room as if they were running it, or read another singer's slot.
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const participantId = url.searchParams.get('participantId') ?? '';
    const sessionId = url.searchParams.get('sessionId') ?? '';

    const auth = this.authorize(participantId, sessionId);
    if (!auth.ok) return new Response('Not a member of this room', { status: 403 });

    const pair = new WebSocketPair();
    const roleTag = auth.isHost ? OnlineDirectory.HOST_TAG : OnlineDirectory.slotTag(auth.slot);
    // Hibernatable, and tagged rather than held in a field — the tags survive an eviction, an
    // in-memory map would not.
    this.ctx.acceptWebSocket(pair[1], [roleTag, OnlineDirectory.participantTag(participantId)]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(socket: WebSocket, raw: string | ArrayBuffer) {
    if (typeof raw !== 'string') return;
    const tags = this.ctx.getTags(socket);

    if (tags.includes(OnlineDirectory.HOST_TAG)) {
      // A superseded host is not one: it is a tab that has not caught up yet, and letting it keep
      // broadcasting would have it fight the host that replaced it.
      if (!this.isCurrentHostSocket(socket)) return;
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
    // Guarded like the host branch above: a client can send anything on its socket, and throwing
    // in this handler is treated as an error for the whole Durable Object — one malformed frame
    // from anyone holding the room code would take the relay down.
    let message: unknown;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }
    const inbound: RelayInboundFrame = { slot: Number(slotTag.slice('slot:'.length)), message };
    // Only the host in charge, for the same reason: two authorities answering the same RPC is
    // worse than none.
    this.ctx
      .getWebSockets(OnlineDirectory.HOST_TAG)
      .filter((host) => this.isCurrentHostSocket(host))
      .forEach((host) => host.send(JSON.stringify(inbound)));
  }

  async webSocketClose(socket: WebSocket) {
    const tags = this.ctx.getTags(socket);

    if (tags.includes(OnlineDirectory.HOST_TAG)) {
      // Only when it leaves the room without a host. The condition is deliberately "is anybody
      // still holding the host socket" rather than "was this the host": a host that leaves cleanly
      // has already had its successor elected by `electFallbackHost`, so checking the closing
      // socket's own identity would swallow the very case this signal exists for. The other side of
      // it is a socket left over from a host that was superseded while throttled — that one closes
      // with the new host's socket already open, and announcing it as a loss would send the room
      // off to elect a successor to the host it just elected.
      if (this.hasLiveHostSocket(socket)) return;
      // The host's socket dies with its tab whether or not any JavaScript got to run, so this is
      // an exact signal where the SFU has none — clients would otherwise sit through the whole
      // heartbeat stall before starting the succession they already know is needed.
      const gone = JSON.stringify({ hostGone: true });
      this.ctx
        .getWebSockets()
        .filter((candidate) => !this.ctx.getTags(candidate).includes(OnlineDirectory.HOST_TAG))
        .forEach((client) => client.send(gone));
      return;
    }

    const slotTag = tags.find((tag) => tag.startsWith('slot:'));
    if (!slotTag) return;
    // The host learns a singer is gone the way it would over the SFU: the pipe closed.
    const closed = JSON.stringify({ slot: Number(slotTag.slice('slot:'.length)), closed: true });
    this.ctx.getWebSockets(OnlineDirectory.HOST_TAG).forEach((host) => host.send(closed));
  }

  /**
   * What this session may open channels for. The signaling layer asks before forwarding any
   * channel request to the SFU — membership here is the only thing standing between a room code
   * and another singer's private slot.
   */
  public authorize(participantId: string, sessionId: string): ChannelAuthorization {
    const member = this.state.members.find((entry) => entry.participantId === participantId);
    // The session must be the one this participant actually joined with, or knowing somebody
    // else's participant id would be enough to borrow their slot.
    if (!member || member.sessionId !== sessionId || !this.state.hostSessionId) return { ok: false };
    return {
      ok: true,
      isHost: this.state.hostParticipantId === participantId,
      slot: member.slot,
      hostSessionId: this.state.hostSessionId,
    };
  }

  public async join(
    participantId: string,
    sessionId: string,
    create: boolean,
    secret?: string,
  ): Promise<JoinRoomResponse> {
    if ((this.state.bannedIds ?? []).includes(participantId)) return { ok: false, reason: 'banned' };
    if (!this.state.created) {
      if (!create) return { ok: false, reason: 'not-found' };
      this.state.created = true;
    }

    // A rejoin (refresh, dropped connection, a fresh SFU session after a network flap) keeps the
    // slot it already owns — otherwise a reconnecting player would consume a second one and a full
    // room could never let anybody back in.
    const existing = this.state.members.find((member) => member.participantId === participantId);
    if (existing) {
      // The secret is what makes this a rejoin rather than a takeover. Without it, replaying
      // somebody else's participant id would re-point their row at the caller's session: the host's
      // channels would move to whoever asked, and any singer could be cut off from their own slot
      // by being pointed at a session that does not exist.
      if (!secretMatches(existing.secret, secret)) return { ok: false, reason: 'not-authorized' };
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
      this.state.members.push({ participantId, sessionId, slot, secret: crypto.randomUUID() });
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
      secret: member.secret,
    };
  }

  /**
   * Removes a participant, optionally banning them.
   *
   * `requestedBy` is the session asking. Anyone may release their own slot; only the current host
   * may remove or ban somebody else — otherwise a room code plus a participant id would be enough
   * to throw any singer out of any room.
   */
  public async leave(
    participantId: string,
    { ban = false, requestedBy }: { ban?: boolean; requestedBy?: { participantId: string; sessionId: string } } = {},
  ): Promise<void> {
    const requester = requestedBy
      ? this.authorize(requestedBy.participantId, requestedBy.sessionId)
      : { ok: false as const };
    const isSelf = requestedBy?.participantId === participantId && requester.ok;
    const isHost = requester.ok && requester.isHost;
    if (!isSelf && !isHost) return;
    if (ban && !isHost) return;

    return this.removeMember(participantId, ban);
  }

  private async removeMember(participantId: string, ban: boolean): Promise<void> {
    const before = this.state.members.length;
    this.state.members = this.state.members.filter((member) => member.participantId !== participantId);
    // A ban is recorded even for somebody already gone — the point is that they cannot come back,
    // and the room logic's own ban list lives in a browser that may not be here much longer.
    if (ban && !(this.state.bannedIds ??= []).includes(participantId)) {
      this.state.bannedIds.push(participantId);
    } else if (this.state.members.length === before) {
      return;
    }
    this.electFallbackHost();
    await this.persist();
  }

  /**
   * A client that watched the host go quiet takes over. `fromEpoch` is a compare-and-swap: two
   * clients noticing the same stall both call this, and only the first one to land wins. The loser
   * gets the winner's epoch back and follows it instead of starting a second room.
   */
  public async promote(
    participantId: string,
    sessionId: string,
    fromEpoch: number,
    secret?: string,
  ): Promise<PromoteHostResponse> {
    const member = this.state.members.find((entry) => entry.participantId === participantId);
    if (!member) {
      return { ok: false, reason: 'not-a-member', epoch: this.state.epoch, hostSessionId: this.state.hostSessionId };
    }
    // Checked before the epoch: the epoch is published in room state, so it is not a secret and
    // cannot stand in for one. Without this, anybody in the room could hand the host role to a
    // session of their choosing by claiming somebody else's participant id.
    if (!secretMatches(member.secret, secret)) {
      return { ok: false, reason: 'not-authorized', epoch: this.state.epoch, hostSessionId: this.state.hostSessionId };
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
