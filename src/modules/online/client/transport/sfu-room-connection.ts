import {
  OnlineJoinOutcome,
  OnlineRoomConnection,
  SfuRoomMembership,
} from '~/modules/online/client/transport/interface';
import { OnlineMessages } from '~/modules/online/protocol/types';
import { joinRoom, keepaliveRoom, leaveRoom, promoteHost } from '~/modules/online/signaling/directory-client';
import { ONLINE_SLOT_COUNT, ROOM_BROADCAST_CHANNEL, slotChannelName } from '~/modules/online/signaling/protocol';
import { SfuSession } from '~/modules/online/signaling/sfu-session';

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

/**
 * This browser's connection to a room's media plane.
 *
 * Topology: the host publishes one broadcast channel that the SFU fans out to everyone, plus one
 * channel per slot. A client subscribes to the broadcast read-only and to its own slot with
 * `canReply`, which makes that slot a private duplex pipe to the host. Cloudflare grants reply
 * access to exactly one subscriber per channel, so slots are handed out by the room directory and
 * never shared — a second claimant would silently steal the first one's upstream.
 *
 * Nothing here knows what the messages mean; the host runtime and `OnlineClient` sit on top.
 */
export class SfuRoomConnection implements OnlineRoomConnection {
  private readonly session = new SfuSession();
  private membership: SfuRoomMembership | null = null;
  private broadcastChannel: RTCDataChannel | null = null;
  /** Host: every slot channel, indexed by slot. Client: only its own, at its own index. */
  private slotChannels = new Map<number, RTCDataChannel>();

  private messageListeners = new Set<(message: OnlineMessages, slot: number | null) => void>();
  private closeListeners = new Set<(slot: number) => void>();

  public constructor(
    private readonly roomCode: string,
    private readonly participantId: string,
  ) {}

  public getMembership = () => this.membership;
  /** Fires when the connection to the SFU is unrecoverable — the caller re-joins from scratch. */
  public onLost = (listener: () => void) => this.session.onLost(listener);
  public getSessionId = () => this.session.getSessionId();
  public isConnected = () => this.session.isConnected() && this.broadcastChannel?.readyState === 'open';

  /** Opens the SFU session, claims a slot in the directory and wires up the channels for whichever
   * role the directory handed back. */
  public join = async ({ create = false } = {}): Promise<OnlineJoinOutcome> => {
    const sessionId = await this.session.open();

    const result = await joinRoom(this.roomCode, { participantId: this.participantId, sessionId, create });
    if (!result.ok) {
      this.session.close();
      return { ok: false, reason: result.reason };
    }

    this.membership = {
      isHost: result.isHost,
      hostSessionId: result.hostSessionId,
      epoch: result.epoch,
      slot: result.slot,
    };
    await this.wireChannels();
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
    return promoteHost(this.roomCode, { participantId: this.participantId, sessionId, fromEpoch: membership.epoch });
  };

  public keepalive = () => keepaliveRoom(this.roomCode);

  public leave = () => leaveRoom(this.roomCode, this.participantId);

  public releaseSlot = (participantId: string) => leaveRoom(this.roomCode, participantId);

  private wireChannels = async () => {
    const membership = this.membership!;

    const specs = membership.isHost
      ? [
          { name: ROOM_BROADCAST_CHANNEL },
          ...Array.from({ length: ONLINE_SLOT_COUNT }, (_, slot) => ({ name: slotChannelName(slot) })),
        ]
      : [
          { name: ROOM_BROADCAST_CHANNEL, publisherSessionId: membership.hostSessionId },
          {
            name: slotChannelName(membership.slot),
            publisherSessionId: membership.hostSessionId,
            canReply: true,
          },
        ];

    const channels = await this.session.createChannels(specs);

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
    channel.addEventListener('message', (event: MessageEvent<string>) => {
      let message: OnlineMessages;
      try {
        message = JSON.parse(event.data);
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
  public broadcast = (message: OnlineMessages) => {
    if (this.broadcastChannel?.readyState !== 'open') return;
    this.broadcastChannel.send(JSON.stringify(message));
  };

  /** Host: down a specific participant's slot. Client: up its own — the `canReply` half of the
   * same negotiated channel, which is why both directions are one call. */
  public sendToSlot = (slot: number, message: OnlineMessages) => {
    const channel = this.slotChannels.get(slot);
    if (channel?.readyState !== 'open') return;
    channel.send(JSON.stringify(message));
  };

  public onMessage = (listener: (message: OnlineMessages, slot: number | null) => void) => {
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
