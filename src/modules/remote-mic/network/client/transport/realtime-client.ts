import { SfuRoomConnection } from '~/modules/network/realtime/sfu-room-connection';
import { transportCloseReason, transportErrorReason } from '~/modules/remote-mic/network/client/network-client';
import { ClientTransport } from '~/modules/remote-mic/network/client/transport/interface';
import { NetworkMessages } from '~/modules/remote-mic/network/messages';
import { msgpackCodec, REALTIME_HOST_SILENCE_MS, RealtimeFrame } from '~/modules/remote-mic/network/realtime';
import { REMOTE_MIC_REALTIME } from '~/modules/remote-mic/network/realtime-protocol';
import Listener from '~/modules/utils/listener';

const SILENCE_CHECK_MS = 1_000;

/** Every step of a join is bounded except the signaling requests themselves; this bounds the lot, so
 * a reconnect loop waiting on an attempt never waits forever. */
const JOIN_TIMEOUT_MS = 30_000;

/**
 * The phone's side of the Realtime transport: a member of the game's directory room, subscribed to
 * the game's broadcast and replying on its own slot.
 *
 * Nothing at the SFU level says the game went away — a reloaded game simply stops publishing — so
 * the phone watches for the game's heartbeat and treats a long silence as a closed connection,
 * which `NetworkClient` answers by reconnecting.
 */
export class RealtimeClientTransport extends Listener<[NetworkMessages]> implements ClientTransport {
  private connection: SfuRoomConnection<RealtimeFrame> | null = null;
  private state: 'idle' | 'connecting' | 'open' | 'closed' = 'idle';
  private lastHeardAt = 0;
  private silenceWatchdog: ReturnType<typeof setInterval> | null = null;
  private onClose: ((reason: transportCloseReason, originalEvent: unknown) => void) | null = null;

  public connect(
    clientId: string,
    roomId: string,
    onConnect: () => void,
    onClose: (reason: transportCloseReason, originalEvent: unknown) => void,
    _onError: (error: transportErrorReason, originalEvent: unknown) => void,
  ): void {
    const connection = new SfuRoomConnection(REMOTE_MIC_REALTIME, roomId, clientId, msgpackCodec);
    this.connection = connection;
    this.onClose = onClose;
    this.state = 'connecting';
    setTimeout(() => {
      if (this.connection === connection && this.state === 'connecting') this.fail('connection-timeout', null);
    }, JOIN_TIMEOUT_MS);
    void this.open(connection, clientId, onConnect);
  }

  private open = async (connection: SfuRoomConnection<RealtimeFrame>, clientId: string, onConnect: () => void) => {
    let outcome;
    try {
      outcome = await connection.join();
    } catch (error) {
      if (this.connection === connection) this.fail('connection-failed', error);
      return;
    }
    if (this.connection !== connection) {
      connection.close();
      return;
    }
    if (!outcome.ok) {
      // `not-authorized` is somebody else holding our id — `NetworkClient` retries under a new one
      this.fail(outcome.reason === 'not-authorized' ? 'unavailable-id' : outcome.reason, outcome);
      return;
    }
    if (outcome.membership.isHost) {
      // Nobody is running the game behind this code; do not sit in the room as its host
      await connection.leave();
      this.fail('not-found', outcome);
      return;
    }

    connection.onMessage(this.handleFrame);
    connection.onLost(() => this.fail('connection-lost', null));
    this.lastHeardAt = Date.now();
    this.silenceWatchdog = setInterval(() => {
      if (Date.now() - this.lastHeardAt > REALTIME_HOST_SILENCE_MS) this.fail('host-lost', null);
    }, SILENCE_CHECK_MS);

    // The game learns which phone owns this slot from this frame and nothing else
    connection.sendToSlot(outcome.membership.slot, { t: 'rt-hello', id: clientId });
    this.state = 'open';
    onConnect();
  };

  private handleFrame = (frame: RealtimeFrame) => {
    this.lastHeardAt = Date.now();
    if (frame.t === 'rt-close') {
      this.fail(frame.reason, frame);
    } else if (frame.t !== 'rt-hb' && frame.t !== 'rt-hello') {
      this.onUpdate(frame);
    }
  };

  private teardown = () => {
    if (this.silenceWatchdog) clearInterval(this.silenceWatchdog);
    this.silenceWatchdog = null;
    this.connection?.close();
    this.connection = null;
    this.state = 'closed';
  };

  private fail = (reason: transportCloseReason, originalEvent: unknown) => {
    if (this.state === 'closed') return;
    this.teardown();
    this.clearAllListeners();
    this.onClose?.(reason, originalEvent);
  };

  public sendEvent(event: NetworkMessages) {
    const slot = this.connection?.getMembership()?.slot;
    if (this.state !== 'open' || slot === undefined) return;
    this.connection!.sendToSlot(slot, event);
  }

  // Like a socket's readyState, a connection still being set up counts
  public isConnected = () => this.state === 'connecting' || this.state === 'open';

  /** Closing on purpose reports nothing — the caller already knows. The directory membership is kept,
   * so a reloading phone comes back to the same slot. */
  public close = () => {
    this.teardown();
  };
}
