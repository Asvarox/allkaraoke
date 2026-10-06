import { RealtimeRoomChannels, RealtimeRoomConnection } from '~/modules/network/realtime/types';
import { OnlineMessages } from '~/modules/online/protocol/types';

export type OnlineRoomChannels = RealtimeRoomChannels<OnlineMessages>;
export type OnlineRoomConnection = RealtimeRoomConnection<OnlineMessages>;

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
