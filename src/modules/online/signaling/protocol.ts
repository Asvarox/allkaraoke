/**
 * Shared contract between the browser and the `/online/*` signaling endpoints in the Worker.
 *
 * The Worker is the only thing that holds the Realtime app token, so every SFU API call is
 * proxied through it. It stays stateless apart from one small Durable Object (the room
 * directory) that is touched on join, leave and host promotion — never while a song is playing.
 *
 * Relative-import-safe: the Worker build has no `~` alias, so nothing here may import from
 * anywhere that does.
 */

/** Channel every participant subscribes to. The host publishes it once and the SFU fans it out,
 * so the host's uplink does not grow with the room. Read-only for everyone but the host. */
export const ROOM_BROADCAST_CHANNEL = 'room';

/** Per-participant duplex pipe. The host publishes one of these per slot; the single client
 * holding the slot subscribes with `canReply: true`, which makes the same negotiated channel
 * bidirectional. Cloudflare grants reply access to exactly one subscriber per publisher channel
 * (a later grant revokes the earlier one), so a slot must never have two live claimants — the
 * directory Durable Object is what guarantees that. */
export const slotChannelName = (slot: number) => `slot-${slot}`;

/** Rooms are capped at ONLINE_MAX_PLAYERS, so the host can publish every slot channel up front
 * and never renegotiate when somebody joins. Kept in sync with `ONLINE_MAX_PLAYERS` by a test —
 * it cannot be imported here without dragging the app's `~` alias into the Worker build. */
export const ONLINE_SLOT_COUNT = 6;

/** A room's directory row is wiped this long after the last call touching it. The host's keepalive
 * is what holds a live room open, so this only has to outlast the gap between keepalives. */
export const DIRECTORY_TTL_MS = 30 * 60 * 1_000;

/** How often the host refreshes the room's TTL. Far enough apart to cost nothing, far enough below
 * the TTL that a couple of missed beats are harmless. */
export const DIRECTORY_KEEPALIVE_MS = 5 * 60 * 1_000;

/** A WebRTC ICE server, in the shape `RTCPeerConnection` takes it. */
export interface IceServerDto {
  urls: string[];
  username?: string;
  credential?: string;
}

/**
 * `GET /online/ice` — what to hand `RTCPeerConnection`.
 *
 * STUN is always there and needs no credentials of any kind, so a checkout with nothing configured
 * still connects. TURN is opt-in: it only appears when the Worker has been given either Cloudflare
 * Realtime TURN keys or a static TURN server, and it only matters for the minority of networks
 * that block UDP to the SFU outright.
 */
export interface IceServersResponse {
  iceServers: IceServerDto[];
  /** Seconds the credentials stay valid; absent when none of them are credentialed. */
  ttlSeconds?: number;
}

export interface SessionDescriptionDto {
  type: 'offer' | 'answer';
  sdp: string;
}

/** `POST /online/session` — opens an SFU session for this browser and establishes its SCTP
 * transport in the same round trip. */
export interface CreateSessionRequest {
  offer: SessionDescriptionDto;
}
export interface CreateSessionResponse {
  sessionId: string;
  answer: SessionDescriptionDto;
}

export interface DataChannelSpec {
  name: string;
  /** Absent for a publisher ('local') channel; the host session id for a subscriber one. */
  publisherSessionId?: string;
  /** Only meaningful on a subscriber channel — asks for the upstream half of the slot pipe. */
  canReply?: boolean;
}

/** `POST /online/datachannels` — creates negotiated channels on an existing session. Returns the
 * ids the browser must pass to `createDataChannel(name, { negotiated: true, id })`. */
export interface CreateDataChannelsRequest {
  sessionId: string;
  channels: DataChannelSpec[];
}
export interface CreateDataChannelsResponse {
  channels: Array<{ name: string; id: number }>;
}

export type JoinRejectedReason = 'room-full' | 'not-found' | 'banned';

/** `POST /online/room/:code/join` — claims a slot in the directory and reports who is hosting. */
export interface JoinRoomRequest {
  participantId: string;
  sessionId: string;
  /** Opens the room when it does not exist yet. Without it an unknown code is `not-found`. */
  create?: boolean;
}
export type JoinRoomResponse =
  | {
      ok: true;
      /** True when this participant is the one that has to run the room logic. */
      isHost: boolean;
      /** Whose channels to subscribe to. Equals the caller's own session when `isHost`. */
      hostSessionId: string;
      /** Bumped on every host change; stamped on every message so a resurrected old host's
       * frames can be dropped instead of fighting the new one. */
      epoch: number;
      /** The slot channel this participant owns for the lifetime of its membership. */
      slot: number;
    }
  | { ok: false; reason: JoinRejectedReason };

/** `POST /online/room/:code/promote` — a client that saw the host go quiet claims the role. The
 * directory accepts it only if `fromEpoch` still matches, so simultaneous claims cannot both win. */
export interface PromoteHostRequest {
  participantId: string;
  sessionId: string;
  fromEpoch: number;
}
export type PromoteHostResponse =
  | { ok: true; epoch: number }
  | { ok: false; reason: 'stale-epoch' | 'not-a-member'; epoch: number; hostSessionId: string | null };

/** `POST /online/room/:code/leave` — frees the slot so somebody else can take it. Best-effort:
 * a browser that just closes is cleaned up by the directory's own expiry instead. */
export interface LeaveRoomRequest {
  participantId: string;
}

/**
 * Which wire a room's messages travel on.
 *
 * `sfu` is production. `relay` is the fallback the Worker reports when no Realtime credentials are
 * configured — the end-to-end suite and a local checkout without a Cloudflare Realtime app. It
 * routes the same frames through the room's Durable Object instead, which is exactly the cost the
 * SFU exists to avoid, so it must never be what production answers with.
 */
export type OnlineDataPlane = 'sfu' | 'relay';

/** `GET /online/room/:code` — lets the join screen check a code without claiming a slot, and tells
 * a client which data plane to open before it commits to one. */
export interface RoomInfoResponse {
  created: boolean;
  hostSessionId: string | null;
  epoch: number;
  dataPlane: OnlineDataPlane;
}

/** Host → relay. Mirrors the two things the SFU gives the host: a fan-out and a per-slot pipe. */
export type RelayHostFrame = { kind: 'broadcast'; message: unknown } | { kind: 'slot'; slot: number; message: unknown };

/** Relay → host. The slot is what the SFU conveys implicitly by which channel a frame arrived on. */
export interface RelayInboundFrame {
  slot: number;
  message: unknown;
}
