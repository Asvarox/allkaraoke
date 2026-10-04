import { getMembershipSecret, setMembershipSecret } from '~/modules/network/realtime/membership-secret';
import { RealtimeService, ROOM_BROADCAST_CHANNEL, slotChannelName } from '~/modules/network/realtime/protocol';
import { SfuSession } from '~/modules/network/realtime/sfu-session';
import { SignalingClient } from '~/modules/network/realtime/signaling-client';
import { RealtimeJoinOutcome, RealtimeRoomConnection, SfuRoomMembership } from '~/modules/network/realtime/types';

/** A negotiated channel is usable as soon as SCTP is up, but `createDataChannel` still returns it
 * in 'connecting' for a moment. Bounded so a channel the SFU never opens fails the join instead of
 * hanging it. */
const CHANNEL_OPEN_TIMEOUT_MS = 10_000;

const waitForOpen = (channel: RTCDataChannel) =>
  new Promise<void>((resolve, reject) => {
    if (channel.readyState === 'open') {
      resolve();
      return;
    }
    const cleanup = () => {
      clearTimeout(timeout);
      channel.removeEventListener('open', onOpen);
      channel.removeEventListener('error', onError);
    };
    const onOpen = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error(`Data channel ${channel.label} failed to open`));
    };
    const timeout = setTimeout(onError, CHANNEL_OPEN_TIMEOUT_MS);
    channel.addEventListener('open', onOpen);
    channel.addEventListener('error', onError);
  });

/** How messages become data-channel frames. Online rooms send JSON text; remote mics send msgpack,
 * which is what their frequency stream has always been packed as. */
export interface SfuFrameCodec<M> {
  encode(message: M): string | ArrayBuffer;
  /** May throw on a frame it cannot read — the frame is then dropped. */
  decode(frame: string | ArrayBuffer): M;
}

export const jsonCodec = <M>(): SfuFrameCodec<M> => ({
  encode: (message) => JSON.stringify(message),
  decode: (frame) => JSON.parse(frame as string),
});

// Split only because `send` is overloaded per type and will not take the union
const sendFrame = (channel: RTCDataChannel, frame: string | ArrayBuffer) =>
  typeof frame === 'string' ? channel.send(frame) : channel.send(frame);

/**
 * This browser's connection to a room's media plane.
 *
 * Topology: the host publishes one broadcast channel that the SFU fans out to everyone, plus one
 * channel per slot. A client subscribes to the broadcast read-only and to its own slot with
 * `canReply`, which makes that slot a private duplex pipe to the host. Cloudflare grants reply
 * access to exactly one subscriber per channel, so slots are handed out by the room directory and
 * never shared — a second claimant would silently steal the first one's upstream.
 *
 * Nothing here knows what the messages mean; online mode and remote mics sit on top.
 */
export class SfuRoomConnection<M> implements RealtimeRoomConnection<M> {
  private readonly signaling: SignalingClient;
  private readonly session: SfuSession;
  private membership: SfuRoomMembership | null = null;
  private broadcastChannel: RTCDataChannel | null = null;
  /** Host: every slot channel, indexed by slot. Client: only its own, at its own index. */
  private slotChannels = new Map<number, RTCDataChannel>();

  private messageListeners = new Set<(message: M, slot: number | null) => void>();
  private closeListeners = new Set<(slot: number) => void>();

  public constructor(
    private readonly service: RealtimeService,
    private readonly roomCode: string,
    private readonly participantId: string,
    private readonly codec: SfuFrameCodec<M>,
  ) {
    this.signaling = new SignalingClient(service);
    this.session = new SfuSession(this.signaling);
  }

  public getMembership = () => this.membership;
  /** Fires when the connection to the SFU is unrecoverable — the caller re-joins from scratch. */
  public onLost = (listener: () => void) => this.session.onLost(listener);

  public getSessionId = () => this.session.getSessionId();
  public getRoundTripTime = () => this.session.getRoundTripTime();
  public isConnected = () => this.session.isConnected() && this.broadcastChannel?.readyState === 'open';

  /** Opens the SFU session, claims a slot in the directory and wires up the channels for whichever
   * role the directory handed back. */
  public join = async ({ create = false } = {}): Promise<RealtimeJoinOutcome> => {
    const sessionId = await this.session.open();

    const result = await this.signaling.joinRoom(this.roomCode, {
      participantId: this.participantId,
      sessionId,
      create,
      // Absent on a first join; on every later one this is what proves the membership is ours
      // rather than one whose participant id we read off the room state.
      secret: getMembershipSecret(this.service, this.roomCode),
    });
    if (!result.ok) {
      this.session.close();
      return { ok: false, reason: result.reason };
    }
    setMembershipSecret(this.service, this.roomCode, result.secret);

    this.membership = {
      isHost: result.isHost,
      hostSessionId: result.hostSessionId,
      epoch: result.epoch,
      slot: result.slot,
    };
    try {
      await this.wireChannels();
    } catch (error) {
      // The slot is claimed by this point, so a half-open attempt has to hand it back rather than
      // hold a seat nobody is sitting in until the room expires.
      await this.releaseOwnMembership();
      throw error;
    }
    return { ok: true, membership: this.membership };
  };

  /** Tears down the channels pointing at the previous host and opens the equivalent set against
   * whoever is hosting now. The SFU session itself survives — only what it is subscribed to
   * changes, so a takeover costs two signaling calls rather than a fresh connection. */
  public rewire = async (membership: SfuRoomMembership): Promise<void> => {
    this.broadcastChannel?.close();
    this.slotChannels.forEach((channel) => channel.close());
    this.broadcastChannel = null;
    this.slotChannels.clear();
    this.membership = membership;
    await this.wireChannels();
  };

  /** Claims the host role. The directory only accepts it if `epoch` is still current, so of two
   * clients reacting to the same stall exactly one wins — and the loser's rejection carries the
   * winner's session, which is how it learns who to re-subscribe to. */
  public promote = async () => {
    const membership = this.membership;
    const sessionId = this.session.getSessionId();
    if (!membership || !sessionId) throw new Error('Not in a room');
    return this.signaling.promoteHost(this.roomCode, {
      participantId: this.participantId,
      sessionId,
      fromEpoch: membership.epoch,
      // The epoch is published in room state, so it is not proof of anything on its own — this is
      // what stops a claim being made on somebody else's behalf.
      secret: getMembershipSecret(this.service, this.roomCode) ?? '',
    });
  };

  /** Undoes a join that could not be completed, so a half-open attempt does not cost a seat. */
  private releaseOwnMembership = async () => {
    this.membership = null;
    await this.leave();
    this.session.close();
  };

  public keepalive = () => this.signaling.keepaliveRoom(this.roomCode);

  private requester = () => ({ participantId: this.participantId, sessionId: this.session.getSessionId()! });

  public leave = () => this.signaling.leaveRoom(this.roomCode, this.participantId, this.requester());

  public releaseSlot = (participantId: string, ban = false) =>
    this.signaling.leaveRoom(this.roomCode, participantId, this.requester(), ban);

  private wireChannels = async () => {
    const membership = this.membership!;

    const specs = membership.isHost
      ? [
          { name: ROOM_BROADCAST_CHANNEL },
          ...Array.from({ length: this.service.slotCount }, (_, slot) => ({ name: slotChannelName(slot) })),
        ]
      : [
          { name: ROOM_BROADCAST_CHANNEL, publisherSessionId: membership.hostSessionId },
          {
            name: slotChannelName(membership.slot),
            publisherSessionId: membership.hostSessionId,
            canReply: true,
          },
        ];

    const channels = await this.session.createChannels(this.roomCode, this.participantId, specs);

    this.broadcastChannel = channels.get(ROOM_BROADCAST_CHANNEL)!;
    // The host does not read its own broadcast (the SFU does not loop it back), but a client does.
    if (!membership.isHost) this.attach(this.broadcastChannel, null);

    for (const [name, channel] of channels) {
      if (name === ROOM_BROADCAST_CHANNEL) continue;
      const slot = Number(name.slice('slot-'.length));
      this.slotChannels.set(slot, channel);
      this.attach(channel, slot);
    }

    await Promise.all([...channels.values()].map(waitForOpen));
  };

  private attach = (channel: RTCDataChannel, slot: number | null) => {
    channel.binaryType = 'arraybuffer';
    channel.addEventListener('message', (event: MessageEvent<string | ArrayBuffer>) => {
      let message: M;
      try {
        message = this.codec.decode(event.data);
      } catch {
        return;
      }
      this.messageListeners.forEach((listener) => listener(message, slot));
    });
    if (slot !== null) {
      channel.addEventListener('close', () => {
        this.closeListeners.forEach((listener) => listener(slot));
      });
    }
  };

  /** Host: one send that reaches every subscriber. Client: not used — a client has no publisher
   * channel and everything it says goes up its own slot. */
  public broadcast = (message: M) => {
    if (this.broadcastChannel?.readyState !== 'open') return;
    sendFrame(this.broadcastChannel, this.codec.encode(message));
  };

  /** Host: down a specific participant's slot. Client: up its own — the `canReply` half of the
   * same negotiated channel, which is why both directions are one call. */
  public sendToSlot = (slot: number, message: M) => {
    const channel = this.slotChannels.get(slot);
    if (channel?.readyState !== 'open') return;
    sendFrame(channel, this.codec.encode(message));
  };

  public onMessage = (listener: (message: M, slot: number | null) => void) => {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  };

  public onSlotClosed = (listener: (slot: number) => void) => {
    this.closeListeners.add(listener);
    return () => this.closeListeners.delete(listener);
  };

  public close = () => {
    this.messageListeners.clear();
    this.closeListeners.clear();
    this.slotChannels.clear();
    this.broadcastChannel = null;
    this.membership = null;
    this.session.close();
  };
}
