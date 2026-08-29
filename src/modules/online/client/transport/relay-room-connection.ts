import {
  OnlineJoinOutcome,
  OnlineRoomConnection,
  SfuRoomMembership,
} from '~/modules/online/client/transport/interface';
import { OnlineMessages } from '~/modules/online/protocol/types';
import {
  joinRoom,
  keepaliveRoom,
  leaveRoom,
  promoteHost,
  signalingUrl,
} from '~/modules/online/signaling/directory-client';
import { RelayHostFrame, RelayInboundFrame } from '~/modules/online/signaling/protocol';

/**
 * The data plane used where there is no Cloudflare Realtime app to talk to: the end-to-end suite,
 * and a local checkout without credentials. Frames go through the room's Durable Object instead of
 * the SFU.
 *
 * This is deliberately the expensive shape — a server in the middle of every message is exactly
 * what the SFU was brought in to stop paying for. It is not a fallback production may take: the
 * Worker only reports `dataPlane: 'relay'` when Realtime is unconfigured, and refuses the upgrade
 * otherwise. What it buys is that everything above `OnlineRoomChannels` — the room logic, the host
 * runtime, slot binding, the whole succession path — is the real code under test.
 */
export class RelayRoomConnection implements OnlineRoomConnection {
  private membership: SfuRoomMembership | null = null;
  private socket: WebSocket | null = null;
  private messageListeners = new Set<(message: OnlineMessages, slot: number | null) => void>();
  private closeListeners = new Set<(slot: number) => void>();
  private lostListeners = new Set<() => void>();

  public constructor(
    private readonly roomCode: string,
    private readonly participantId: string,
  ) {}

  public getMembership = () => this.membership;
  /** The directory only needs something stable to identify this browser by; with no SFU session to
   * name, the participant id does the job. */
  public getSessionId = () => this.participantId;
  public isConnected = () => this.socket?.readyState === WebSocket.OPEN;

  public onLost = (listener: () => void) => {
    this.lostListeners.add(listener);
    return () => this.lostListeners.delete(listener);
  };

  public join = async ({ create = false } = {}): Promise<OnlineJoinOutcome> => {
    const result = await joinRoom(this.roomCode, {
      participantId: this.participantId,
      sessionId: this.participantId,
      create,
    });
    if (!result.ok) return { ok: false, reason: result.reason };

    this.membership = {
      isHost: result.isHost,
      hostSessionId: result.hostSessionId,
      epoch: result.epoch,
      slot: result.slot,
    };
    try {
      await this.openSocket();
    } catch (error) {
      // The slot is already claimed at this point; hand it back rather than let the directory hold
      // it until the room expires.
      this.membership = null;
      this.socket?.close();
      this.socket = null;
      await this.leave();
      throw error;
    }
    return { ok: true, membership: this.membership };
  };

  public rewire = async (membership: SfuRoomMembership): Promise<void> => {
    this.socket?.close();
    this.socket = null;
    this.membership = membership;
    await this.openSocket();
  };

  public promote = async () =>
    promoteHost(this.roomCode, {
      participantId: this.participantId,
      sessionId: this.participantId,
      fromEpoch: this.membership!.epoch,
    });

  public keepalive = () => keepaliveRoom(this.roomCode);
  public leave = () => leaveRoom(this.roomCode, this.participantId);
  public releaseSlot = (participantId: string, ban = false) => leaveRoom(this.roomCode, participantId, ban);

  private openSocket = () =>
    new Promise<void>((resolve, reject) => {
      const membership = this.membership!;
      const base = signalingUrl(
        `/online/room/${this.roomCode}/relay?role=${membership.isHost ? 'host' : 'client'}&slot=${membership.slot}`,
      );
      const url = new URL(base, global.location.href);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

      const socket = new WebSocket(url.toString());
      this.socket = socket;
      socket.onopen = () => resolve();
      socket.onerror = () => reject(new Error('Relay socket failed'));
      socket.onclose = () => {
        if (this.socket === socket) this.lostListeners.forEach((listener) => listener());
      };
      socket.onmessage = (event: MessageEvent<string>) => this.handleFrame(event.data, membership.isHost);
    });

  private handleFrame = (raw: string, isHost: boolean) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    if (!isHost) {
      // A client cannot tell a broadcast from a reply on its own slot, and does not need to — the
      // SFU version hands both to the same listeners too.
      this.messageListeners.forEach((listener) => listener(parsed as OnlineMessages, null));
      return;
    }

    const frame = parsed as RelayInboundFrame & { closed?: boolean };
    if (frame.closed) {
      this.closeListeners.forEach((listener) => listener(frame.slot));
      return;
    }
    this.messageListeners.forEach((listener) => listener(frame.message as OnlineMessages, frame.slot));
  };

  private sendHostFrame = (frame: RelayHostFrame) => {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(frame));
  };

  public broadcast = (message: OnlineMessages) => this.sendHostFrame({ kind: 'broadcast', message });

  public sendToSlot = (slot: number, message: OnlineMessages) => {
    if (this.membership?.isHost) {
      this.sendHostFrame({ kind: 'slot', slot, message });
      return;
    }
    // A client's socket is already bound to its slot by the relay, so it just sends the message.
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(message));
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
    this.lostListeners.clear();
    const socket = this.socket;
    this.socket = null;
    socket?.close();
    this.membership = null;
  };
}
