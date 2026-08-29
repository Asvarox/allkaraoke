import { OnlineMessages } from '~/modules/online/protocol/types';

/** Where this browser sits in a room: which side of the wiring it is on, whose channels it should
 * be subscribed to, and which slot is its own. */
export interface SfuRoomMembership {
  isHost: boolean;
  hostSessionId: string;
  /** Bumped by the directory on every host change; carried into a promotion claim. */
  epoch: number;
  slot: number;
}

export type OnlineJoinOutcome =
  | { ok: true; membership: SfuRoomMembership }
  | { ok: false; reason: 'room-full' | 'not-found' | 'banned' };

/**
 * The room's channels, as the host runtime and the client transport use them. `SfuRoomConnection`
 * is the real implementation; depending on the shape rather than the class is what lets the host
 * be driven by an in-memory fabric in tests, where there is no WebRTC to speak of.
 */
export interface OnlineRoomChannels {
  broadcast(message: OnlineMessages): void;
  sendToSlot(slot: number, message: OnlineMessages): void;
  onMessage(listener: (message: OnlineMessages, slot: number | null) => void): () => void;
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
 * Two implementations. `SfuRoomConnection` is the real one. The end-to-end suite uses a local
 * fabric instead — the SFU is the one piece of this that cannot be stood up in CI, and everything
 * that is actually ours (slot assignment, host election, takeover, the room logic itself) is
 * exercised either way.
 */
export interface OnlineRoomConnection extends OnlineRoomChannels {
  join(options?: { create?: boolean }): Promise<OnlineJoinOutcome>;
  /** Re-points at a different host without giving up this browser's own membership. */
  rewire(membership: SfuRoomMembership): Promise<void>;
  promote(): Promise<{ ok: boolean; epoch: number; hostSessionId?: string | null }>;
  /** Fires when the connection is unrecoverable — the caller re-joins from scratch. */
  onLost(listener: () => void): () => void;
  close(): void;
}

/** One connected participant, from the host's side. Structurally satisfies the RPC core's
 * `RpcSenderInterface`, so `RpcServer` can reply to it without knowing anything about the SFU. */
export interface OnlinePeerSender {
  /** The participant id, bound to this slot by the peer's `hello`. */
  peer: string;
  send(payload: unknown): void;
}

/** What the host runtime needs from the wire: a broadcast that the SFU fans out, a private pipe
 * per participant, and notice when one of them goes away. */
export interface OnlineHostTransport {
  /** One send, delivered to everyone subscribed. This is the whole reason the SFU is here: the
   * host's uplink does not grow with the number of singers. */
  broadcast(message: OnlineMessages): void;
  getPeer(participantId: string): OnlinePeerSender | undefined;
  getPeers(): OnlinePeerSender[];
  /** Drops a participant's slot — used by the room logic's `disconnect` (a kick). */
  removePeer(participantId: string): void;
  addListener(listener: (message: OnlineMessages, sender: OnlinePeerSender) => void): void;
  removeListener(listener: (message: OnlineMessages, sender: OnlinePeerSender) => void): void;
  /** Fires when a peer's channel closes, so the room logic can start its reconnect grace window. */
  onPeerLost(listener: (participantId: string) => void): () => void;
  close(): void;
}

/** What `OnlineClient` needs from the wire. Deliberately the same shape the WebSocket transport
 * had, so the RPC proxy and subscription manager did not have to learn anything new. */
export interface OnlineClientTransport {
  isConnected(): boolean;
  sendEvent(message: unknown): void;
  addListener(listener: (message: OnlineMessages) => void): unknown;
  removeListener(listener: (message: OnlineMessages) => void): void;
  clearAllListeners(): void;
  close(): void;
}
