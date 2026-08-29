import { v4 as uuid } from 'uuid';

import { PingPongTracker } from '~/modules/network/rpc/ping-pong-tracker';
import { createFireAndForgetProxy, createRpcProxy } from '~/modules/network/rpc/rpc-client';
import { ClientSubscriptionManager } from '~/modules/network/rpc/subscription-manager';
import { trackOnlineRoomConnectAttempt } from '~/modules/online/client/online-analytics';
import { createRoomConnection } from '~/modules/online/client/transport/create-room-connection';
import {
  OnlineClientTransport,
  OnlineRoomConnection,
  SfuRoomMembership,
} from '~/modules/online/client/transport/interface';
import { SfuClientTransport } from '~/modules/online/client/transport/sfu-client-transport';
import {
  OnlineHostSnapshot,
  OnlineRoomHost,
  stashHostSnapshot,
  takeStashedHostSnapshot,
} from '~/modules/online/host/online-room-host';
import { ONLINE_HOST_STALL_MS, ONLINE_PROMOTE_STAGGER_MS } from '~/modules/online/protocol/consts';
import { OnlineServerRpc } from '~/modules/online/protocol/room-logic';
import { OnlineMessages, OnlineRoomState, OnlineSubscriptionChannels } from '~/modules/online/protocol/types';
import { fetchRoomInfo } from '~/modules/online/signaling/directory-client';
import Listener from '~/modules/utils/listener';
import storage from '~/modules/utils/storage';

const PARTICIPANT_ID_KEY = 'ONLINE_PARTICIPANT_ID';
export const ONLINE_NAME_KEY = 'ONLINE_PARTICIPANT_NAME';

const RECONNECT_BASE_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 15_000;

/** Exponential backoff with full jitter, capped, so a room outage doesn't get hammered by every
 * client reconnecting in lockstep on a fixed interval. */
const getReconnectDelayMs = (attempt: number): number => {
  const cap = Math.min(RECONNECT_MAX_DELAY_MS, RECONNECT_BASE_DELAY_MS * 2 ** attempt);
  return Math.random() * cap;
};

export type OnlineConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'rejected'
  | 'error';

interface JoinedMessage {
  t: 'joined';
  state: OnlineRoomState;
}
interface JoinRejectedMessage {
  t: 'join-rejected';
  reason: string;
}
type IncomingMessage = OnlineMessages | JoinedMessage | JoinRejectedMessage;

/**
 * This browser's seat in an online room.
 *
 * The room's authority runs in a browser now, not on a server — either somebody else's, reached
 * over the Cloudflare SFU, or this one's, in which case the transport is a loopback straight into
 * `OnlineRoomHost` in the same tab. Above this line the difference is invisible: the RPC proxy,
 * the subscription manager and the ping loop are the same either way.
 *
 * The other half of the job is watching the host. A host that stops sending heartbeats — a closed
 * tab, or one throttled into the background — is replaced by the next singer in line, and every
 * client here is a candidate.
 */
export class OnlineClient extends Listener<[OnlineConnectionStatus, string?]> {
  private transport: OnlineClientTransport | undefined;
  private connection: OnlineRoomConnection | null = null;
  private host: OnlineRoomHost | null = null;
  private participantId: string | null = storage.getItem(PARTICIPANT_ID_KEY);
  private roomCode: string | null = null;
  private name = '';
  private createRoom = false;
  private status: OnlineConnectionStatus = 'disconnected';
  private shouldReconnect = false;
  private reconnectAttempts = 0;
  private clockOffsetMs = 0;
  private pingPong = new PingPongTracker();
  /** Set while this browser has gone idle (see `useIsUserActive`). Nothing here holds a server
   * awake any more, but a silent client still costs the host bandwidth and everyone else a row
   * that pretends to be live, so the loop still stops. */
  private reportingIdle = false;

  /** Last host state seen on the wire, kept so that taking over means resuming the song rather
   * than restarting it. Only meaningful while somebody else is hosting. */
  private lastHostSnapshot: OnlineHostSnapshot | null = null;
  private lastHeartbeatAt = 0;
  private heartbeatWatchdog: ReturnType<typeof setInterval> | null = null;
  private promoting = false;

  public readonly subscriptions = new ClientSubscriptionManager<OnlineSubscriptionChannels>();

  public readonly rpc: OnlineServerRpc = createRpcProxy(
    () => this.transport,
    (callback) => {
      const handler = (status: OnlineConnectionStatus) => {
        if (status === 'disconnected' || status === 'reconnecting' || status === 'error' || status === 'rejected') {
          callback();
        }
      };
      this.addListener(handler);
      return () => this.removeListener(handler);
    },
  );

  /** Same calls as `rpc`, but nothing to await and rejections are swallowed — for the many
   * notify-the-room calls whose result nobody reads. */
  public readonly send = createFireAndForgetProxy(this.rpc);

  public getParticipantId = () => {
    if (this.participantId === null) {
      this.participantId = uuid();
      storage.setItem(PARTICIPANT_ID_KEY, this.participantId);
    }
    return this.participantId;
  };

  public getStatus = () => this.status;
  public getRoomCode = () => this.roomCode;
  public getName = () => this.name;
  /** True while the room's authority is running in this tab. */
  public getIsHosting = () => this.host !== null;

  // Tracks the outcome of the current connect() call once, whichever of 'connected'/'rejected'
  // is reached first — reconnects after that (dropped connection, retries) aren't new attempts.
  private hasTrackedConnectAttempt = false;

  private setStatus = (status: OnlineConnectionStatus, detail?: string) => {
    this.status = status;
    if (!this.hasTrackedConnectAttempt && (status === 'connected' || status === 'rejected')) {
      this.hasTrackedConnectAttempt = true;
      trackOnlineRoomConnectAttempt(
        this.createRoom ? 'create' : 'join',
        status === 'connected' ? 'success' : 'failed',
        detail,
      );
    }
    this.onUpdate(status, detail);
  };

  public connect = (roomCode: string, name: string, { create = false } = {}) => {
    const normalizedRoomCode = roomCode.toLowerCase();
    if (this.transport?.isConnected() && this.roomCode === normalizedRoomCode) {
      return;
    }
    this.disconnect();
    this.roomCode = normalizedRoomCode;
    this.name = name;
    this.createRoom = create;
    this.shouldReconnect = true;
    this.hasTrackedConnectAttempt = false;
    this.reconnectAttempts = 0;
    void this.openRoom(false);
  };

  private scheduleReconnect = () => {
    if (!this.shouldReconnect) {
      this.setStatus('disconnected');
      return;
    }
    this.setStatus('reconnecting');
    const delay = getReconnectDelayMs(this.reconnectAttempts);
    this.reconnectAttempts += 1;
    setTimeout(() => {
      if (this.shouldReconnect) void this.openRoom(true);
    }, delay);
  };

  private openRoom = async (isReconnect: boolean) => {
    if (!this.roomCode) return;
    this.setStatus(isReconnect ? 'reconnecting' : 'connecting');

    let connection: OnlineRoomConnection | null = null;
    let outcome;
    try {
      // Which data plane a room uses is the Worker's answer, not a guess — see createRoomConnection.
      connection = await createRoomConnection(this.roomCode, this.getParticipantId());
      this.connection = connection;
      outcome = await connection.join({ create: this.createRoom });
    } catch {
      connection?.close();
      if (this.connection === connection) this.connection = null;
      this.scheduleReconnect();
      return;
    }
    // A newer connect()/disconnect() overtook this one while it was in flight
    if (this.connection !== connection) {
      connection.close();
      return;
    }

    if (!outcome.ok) {
      this.shouldReconnect = false;
      this.setStatus('rejected', outcome.reason);
      connection.close();
      this.connection = null;
      return;
    }

    connection.onLost(() => {
      if (this.connection === connection) this.scheduleReconnect();
    });

    this.attachRole(outcome.membership);
  };

  /** Builds the transport for whichever side of the room this browser ended up on, and — when it
   * is the host — starts the room logic in this tab. */
  private attachRole = (membership: SfuRoomMembership, restoreFrom: OnlineHostSnapshot | null = null) => {
    const connection = this.connection!;
    this.transport?.clearAllListeners();
    this.host?.close();
    this.host = null;

    if (membership.isHost) {
      this.host = new OnlineRoomHost({
        roomCode: this.roomCode!,
        participantId: this.getParticipantId(),
        connection,
        membership,
        // A promotion brings its own snapshot; otherwise this may be the same tab coming back from
        // a navigation, in which case the room it was running is waiting in sessionStorage.
        restoreFrom: restoreFrom ?? takeStashedHostSnapshot(this.roomCode!),
      });
      this.transport = this.host.getLoopbackTransport();
      this.stopHeartbeatWatchdog();
    } else {
      this.transport = new SfuClientTransport(connection);
      this.startHeartbeatWatchdog();
    }

    this.transport.addListener(this.handleMessage);

    if (!membership.isHost) {
      // The host learns who owns a slot from this and nothing else — it is the first thing that
      // must go up the pipe, before any RPC that expects to be recognised as a participant.
      this.transport.sendEvent({
        t: 'hello',
        participantId: this.getParticipantId(),
        name: this.name,
        create: this.createRoom,
      });
    } else {
      // The host's own join happens inside OnlineRoomHost over the loopback; the name still has to
      // be told to the room the normal way.
      this.send.room.setName(this.name);
    }
  };

  private handleMessage = (message: IncomingMessage) => {
    if (message.t === 'joined') {
      this.setStatus('connected');
      this.reconnectAttempts = 0;
      // A reconnect while idle (a dropped connection doesn't wake anyone up) stays quiet
      if (!this.reportingIdle) this.pingPong.start(this.sendPing);
      this.subscriptions.setSendFunctions(
        (channel) => this.transport?.sendEvent({ t: 'rpc-sub', channel }),
        (channel) => this.transport?.sendEvent({ t: 'rpc-unsub', channel }),
      );
      this.subscriptions.handlePublish('room-state', message.state);
      void this.estimateClockOffset();
    } else if (message.t === 'join-rejected') {
      this.shouldReconnect = false;
      this.setStatus('rejected', message.reason);
    } else if (message.t === 'rpc-pub') {
      this.subscriptions.handlePublish(
        message.channel,
        message.data as OnlineSubscriptionChannels[keyof OnlineSubscriptionChannels] as never,
      );
    } else if (message.t === 'hb') {
      this.lastHeartbeatAt = Date.now();
      const membership = this.connection?.getMembership();
      // A heartbeat from a newer epoch than the one this client joined on means somebody else took
      // over while we were subscribed to the old host. Re-wire rather than sit on a dead channel.
      if (membership && !membership.isHost && message.epoch > membership.epoch) {
        void this.followNewHost(message.epoch);
      }
    } else if (message.t === 'snapshot') {
      this.lastHostSnapshot = message.state as OnlineHostSnapshot;
      // Persisted, not just held: this tab navigates between the lobby, the song and the results,
      // and a client that took over right after one of those would otherwise have nothing to
      // restore the room from.
      if (this.roomCode) stashHostSnapshot(this.roomCode, this.lastHostSnapshot);
    } else if (message.t === 'ping') {
      this.transport?.sendEvent({ t: 'pong' });
    } else if (message.t === 'pong') {
      this.pingPong.handlePong();
    }
  };

  // --- host succession ---

  private startHeartbeatWatchdog = () => {
    this.stopHeartbeatWatchdog();
    this.lastHeartbeatAt = Date.now();
    this.heartbeatWatchdog = setInterval(() => {
      if (this.promoting || Date.now() - this.lastHeartbeatAt < ONLINE_HOST_STALL_MS) return;
      void this.claimHost();
    }, ONLINE_HOST_HEARTBEAT_CHECK_MS);
  };

  private stopHeartbeatWatchdog = () => {
    if (this.heartbeatWatchdog) clearInterval(this.heartbeatWatchdog);
    this.heartbeatWatchdog = null;
  };

  /**
   * How far down the succession line this browser is: connected participants ordered the way the
   * room logic itself elects a host, minus the one that just went quiet. Everybody computes the
   * same ranking from the same published state, so the obvious successor claims first and the rest
   * only pile in if it turns out to be gone too.
   */
  private getSuccessionRank = (): number => {
    const state = this.subscriptions.getSnapshot('room-state');
    if (!state) return 0;
    const candidates = state.participants
      .filter((participant) => participant.connected && participant.id !== state.hostId)
      .sort((a, b) => a.joinOrder - b.joinOrder);
    const index = candidates.findIndex((participant) => participant.id === this.getParticipantId());
    return index < 0 ? candidates.length : index;
  };

  private claimHost = async () => {
    const connection = this.connection;
    if (!connection || this.promoting) return;
    this.promoting = true;
    try {
      await delay(this.getSuccessionRank() * ONLINE_PROMOTE_STAGGER_MS);
      // Somebody beat us to it and the room came back to life while we were waiting our turn.
      if (Date.now() - this.lastHeartbeatAt < ONLINE_HOST_STALL_MS) return;
      if (this.connection !== connection) return;

      const result = await connection.promote();
      if (!result.ok) {
        // The rejection is the notification: it carries whoever did win.
        if (result.hostSessionId) await this.followNewHost(result.epoch, result.hostSessionId);
        return;
      }
      // Read only now that the claim has landed: taking the stash consumes it, and losing a race
      // is the normal outcome for everyone but one candidate — they must keep theirs for the next
      // stall.
      const restoreFrom = this.lastHostSnapshot ?? takeStashedHostSnapshot(this.roomCode!);

      const membership: SfuRoomMembership = {
        isHost: true,
        hostSessionId: connection.getSessionId()!,
        epoch: result.epoch,
        slot: connection.getMembership()!.slot,
      };
      await connection.rewire(membership);
      this.attachRole(membership, restoreFrom);
    } catch {
      // Promotion is retried by the watchdog on its next tick — nothing to unwind here.
    } finally {
      this.promoting = false;
    }
  };

  /** Re-subscribes to a different host's channels, keeping this browser's own SFU session. */
  private followNewHost = async (epoch: number, hostSessionId?: string) => {
    const connection = this.connection;
    const current = connection?.getMembership();
    if (!connection || !current || current.epoch >= epoch) return;

    let resolvedHostSessionId = hostSessionId;
    if (!resolvedHostSessionId) {
      const info = await fetchRoomInfo(this.roomCode!);
      if (!info?.hostSessionId) return;
      resolvedHostSessionId = info.hostSessionId;
    }

    const membership: SfuRoomMembership = { ...current, isHost: false, hostSessionId: resolvedHostSessionId, epoch };
    await connection.rewire(membership);
    this.attachRole(membership);
  };

  /** Stop (or restart) the ping loop as this browser goes idle and comes back. The last measured
   * latency is kept, so a frozen `getLatency()` still reports something sensible — consumers hide
   * the ping for idle singers rather than trusting it. */
  public setReportingIdle = (idle: boolean) => {
    if (this.reportingIdle === idle) return;
    this.reportingIdle = idle;
    if (idle) {
      this.pingPong.stop();
    } else if (this.status === 'connected') {
      this.pingPong.start(this.sendPing);
    }
  };

  private sendPing = () => {
    if (!this.transport?.isConnected()) return;
    this.transport.sendEvent({ t: 'ping' });
  };

  /** Latest measured round-trip latency to the host, ms. */
  public getLatency = () => this.pingPong.getLatency();

  public disconnect = () => {
    this.shouldReconnect = false;
    this.reportingIdle = false;
    this.pingPong.stop();
    this.stopHeartbeatWatchdog();
    this.host?.close();
    this.host = null;
    this.transport?.clearAllListeners();
    this.transport?.close();
    this.transport = undefined;
    if (this.connection) {
      void this.connection.leave();
      this.connection.close();
      this.connection = null;
    }
    this.lastHostSnapshot = null;
    this.roomCode = null;
    if (this.status !== 'disconnected') {
      this.setStatus('disconnected');
    }
  };

  /** Estimates host-clock offset by sampling getServerTime and taking the median. */
  private estimateClockOffset = async () => {
    const samples: number[] = [];
    for (let i = 0; i < 5; i++) {
      try {
        const before = Date.now();
        const serverTime = await this.rpc.room.getServerTime();
        const after = Date.now();
        samples.push(serverTime + (after - before) / 2 - after);
      } catch {
        break;
      }
    }
    if (samples.length) {
      samples.sort((a, b) => a - b);
      this.clockOffsetMs = samples[Math.floor(samples.length / 2)];
    }
  };

  /** Current time on the host's clock (ms). */
  public serverNow = () => Date.now() + this.clockOffsetMs;

  /** Converts a host timestamp to the local clock. */
  public serverTimeToLocal = (serverTimeMs: number) => serverTimeMs - this.clockOffsetMs;
}

/** How often the watchdog checks the heartbeat. Finer than the stall threshold so a takeover is
 * not delayed by up to a whole extra window. */
const ONLINE_HOST_HEARTBEAT_CHECK_MS = 500;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Checks whether a room code was actually opened, without claiming a slot in it. */
export const checkRoomExists = async (roomCode: string): Promise<boolean> =>
  (await fetchRoomInfo(roomCode))?.created === true;

export default new OnlineClient();
