import { JoinRejectedReason } from '~/modules/network/realtime/protocol';

/** Where this browser sits in a room: which side of the wiring it is on, whose channels it should
 * be subscribed to, and which slot is its own. */
export interface SfuRoomMembership {
  isHost: boolean;
  hostSessionId: string;
  /** Bumped by the directory on every host change; carried into a promotion claim. */
  epoch: number;
  slot: number;
}

export type RealtimeJoinOutcome =
  // The reason is the directory's, passed through unchanged — restating the union here let the two
  // drift, and a reason the transport did not know about stopped compiling rather than reaching the
  // caller that has to act on it.
  { ok: true; membership: SfuRoomMembership } | { ok: false; reason: JoinRejectedReason };

/**
 * A room's channels, as the host side and the client side use them. `SfuRoomConnection`
 * is the real implementation; depending on the shape rather than the class is what lets the host
 * be driven by an in-memory fabric in tests, where there is no WebRTC to speak of.
 */
export interface RealtimeRoomChannels<M> {
  broadcast(message: M): void;
  sendToSlot(slot: number, message: M): void;
  onMessage(listener: (message: M, slot: number | null) => void): () => void;
  onSlotClosed(listener: (slot: number) => void): () => void;
  getMembership(): SfuRoomMembership | null;
  getSessionId(): string | null;
  isConnected(): boolean;
  keepalive(): Promise<unknown>;
  leave(): Promise<unknown>;
  /** Frees somebody else's slot in the directory. Only the host calls this — it is the only side
   * that can tell that a participant is gone for good rather than momentarily quiet. `ban` marks
   * a kick, which also stops them re-claiming a slot. */
  releaseSlot(participantId: string, ban?: boolean): Promise<unknown>;
}

/**
 * A full connection to a room: the directory dance (claim a slot, learn who hosts, take over) plus
 * the channels the messages travel on.
 *
 * `SfuRoomConnection` is the real implementation; the host runtime's tests drive an in-memory
 * fabric instead.
 */
export interface RealtimeRoomConnection<M> extends RealtimeRoomChannels<M> {
  join(options?: { create?: boolean }): Promise<RealtimeJoinOutcome>;
  /** Re-points at a different host without giving up this browser's own membership. */
  rewire(membership: SfuRoomMembership): Promise<void>;
  promote(): Promise<{ ok: boolean; epoch: number; hostSessionId?: string | null }>;
  /** Fires when the connection is unrecoverable — the caller re-joins from scratch. */
  onLost(listener: () => void): () => void;
  close(): void;
}
