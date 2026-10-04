import { v4 } from 'uuid';

import { DIRECTORY_KEEPALIVE_MS } from '~/modules/network/realtime/protocol';
import { SfuRoomConnection } from '~/modules/network/realtime/sfu-room-connection';
import { NetworkMessages } from '~/modules/remote-mic/network/messages';
import {
  isRealtimeControlMessage,
  msgpackCodec,
  REALTIME_HEARTBEAT_MS,
  RealtimeFrame,
} from '~/modules/remote-mic/network/realtime';
import { REMOTE_MIC_REALTIME } from '~/modules/remote-mic/network/realtime-protocol';
import {
  SenderInterface,
  ServerTransport,
  transportCloseReason,
} from '~/modules/remote-mic/network/server/transport/interface';
import Listener from '~/modules/utils/listener';
import storage from '~/modules/utils/storage';

const HOST_ID_KEY = 'REMOTE_MIC_REALTIME_HOST_ID';

/** The game's participant id in the directory. Stable across reloads, so a reloaded game proves the
 * room is still its own with the membership secret it stored on the first join. */
const getHostId = () => {
  let id = storage.getItem<string>(HOST_ID_KEY);
  if (!id) {
    id = v4();
    storage.setItem(HOST_ID_KEY, id);
  }
  return id;
};

const ROUND_TRIP_POLL_MS = 5_000;

/** A phone's slot goes back to the directory after this long without a frame. Phones ping every
 * couple of seconds, so this only catches phones that are gone — without it every phone that ever
 * joined would keep a slot until the room expires, and a long party would run out of them. */
const SILENT_PEER_RELEASE_MS = 10 * 60 * 1_000;

type DataCallback = (data: NetworkMessages) => void;

/**
 * The game's side of the Realtime transport: it hosts a directory room under its game code and
 * publishes a slot channel per phone. Which phone is on which slot is learned from the `rt-hello`
 * each phone sends first.
 */
export class RealtimeServerTransport extends Listener<[NetworkMessages, SenderInterface]> implements ServerTransport {
  public readonly name = 'Realtime';
  private connection: SfuRoomConnection<RealtimeFrame> | null = null;
  private timers: Array<ReturnType<typeof setInterval>> = [];
  private latency = 0;

  private slotByPeer = new Map<string, number>();
  private peerBySlot = new Map<number, string>();
  private lastHeardAt = new Map<string, number>();
  // Keyed by peer rather than by sender object: a reconnecting phone gets a new sender, and
  // whoever subscribed through the old one must keep receiving its frames
  private dataCallbacks = new Map<string, Set<DataCallback>>();

  public connect(
    roomId: string,
    onConnect: () => void,
    onClose: (reason: transportCloseReason, originalEvent: unknown) => void,
  ) {
    const connection = new SfuRoomConnection(REMOTE_MIC_REALTIME, roomId, getHostId(), msgpackCodec);
    this.connection = connection;
    void this.open(connection, onConnect, onClose);
  }

  private open = async (
    connection: SfuRoomConnection<RealtimeFrame>,
    onConnect: () => void,
    onClose: (reason: transportCloseReason, originalEvent: unknown) => void,
  ) => {
    let outcome;
    try {
      outcome = await connection.join({ create: true });
    } catch (error) {
      connection.close();
      if (this.connection === connection) onClose('connection-failed', error);
      return;
    }
    if (this.connection !== connection) {
      connection.close();
      return;
    }
    if (!outcome.ok || !outcome.membership.isHost) {
      // Somebody else's room under the same code, or ours with a secret this browser no longer has
      if (outcome.ok) await connection.leave();
      connection.close();
      onClose('room-taken', outcome);
      return;
    }

    connection.onMessage(this.handleFrame);
    connection.onLost(() => {
      if (this.connection !== connection) return;
      this.disconnect();
      onClose('connection-lost', null);
    });
    this.timers = [
      setInterval(() => connection.broadcast({ t: 'rt-hb' }), REALTIME_HEARTBEAT_MS),
      setInterval(() => void connection.keepalive(), DIRECTORY_KEEPALIVE_MS),
      setInterval(this.measureRoundTrip, ROUND_TRIP_POLL_MS),
      setInterval(this.releaseSilentPeers, SILENT_PEER_RELEASE_MS / 10),
    ];
    this.measureRoundTrip();
    onConnect();
  };

  private handleFrame = (frame: RealtimeFrame, slot: number | null) => {
    if (slot === null) return;
    if (frame.t === 'rt-hello') {
      const previousSlot = this.slotByPeer.get(frame.id);
      if (previousSlot !== undefined) this.peerBySlot.delete(previousSlot);
      this.slotByPeer.set(frame.id, slot);
      this.peerBySlot.set(slot, frame.id);
    }
    const peer = this.peerBySlot.get(slot);
    if (!peer) return;
    this.lastHeardAt.set(peer, Date.now());
    if (isRealtimeControlMessage(frame)) return;

    this.onUpdate(frame, this.senderFor(peer));
    this.dataCallbacks.get(peer)?.forEach((callback) => callback(frame));
  };

  private senderFor = (peer: string): SenderInterface => ({
    peer,
    send: (payload) => this.sendTo(peer, payload),
    on: (event, callback) => {
      if (event !== 'data') return;
      if (!this.dataCallbacks.has(peer)) this.dataCallbacks.set(peer, new Set());
      this.dataCallbacks.get(peer)!.add(callback);
    },
    off: (event, callback) => {
      if (event === 'data') this.dataCallbacks.get(peer)?.delete(callback);
    },
    // Called as the game unloads: tells the phone to reconnect now rather than wait out the silence
    close: () => this.sendTo(peer, { t: 'rt-close', reason: 'host-closed' }),
  });

  private sendTo = (peer: string, payload: RealtimeFrame) => {
    const slot = this.slotByPeer.get(peer);
    if (slot !== undefined) this.connection?.sendToSlot(slot, payload);
  };

  private forgetPeer = (peer: string) => {
    const slot = this.slotByPeer.get(peer);
    if (slot !== undefined) this.peerBySlot.delete(slot);
    this.slotByPeer.delete(peer);
    this.lastHeardAt.delete(peer);
  };

  private releaseSilentPeers = () => {
    const now = Date.now();
    this.lastHeardAt.forEach((heardAt, peer) => {
      if (now - heardAt < SILENT_PEER_RELEASE_MS) return;
      this.forgetPeer(peer);
      void this.connection?.releaseSlot(peer);
    });
  };

  private measureRoundTrip = () => {
    void this.connection?.getRoundTripTime().then((roundTripTime) => {
      if (roundTripTime !== null) this.latency = roundTripTime;
    });
  };

  // Keeps the directory membership: a reloading game comes back to the same room, phones and all
  public disconnect = () => {
    this.timers.forEach(clearInterval);
    this.timers = [];
    this.connection?.close();
    this.connection = null;
    this.slotByPeer.clear();
    this.peerBySlot.clear();
    this.lastHeardAt.clear();
  };

  public getCurrentPing = () => this.latency;

  public removePlayer(playerId: string) {
    this.sendTo(playerId, { t: 'rt-close', reason: 'player-removed' });
    this.forgetPeer(playerId);
    void this.connection?.releaseSlot(playerId);
  }
}
