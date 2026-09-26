import { v4 as uuid } from 'uuid';

import { defineMutation, defineQuery } from '~/modules/network/rpc/define';
import { ExtractContract } from '~/modules/network/rpc/types';
import { unpackChartTransfer } from '~/modules/online/protocol/chart-transfer';
import {
  ONLINE_BUFFERING_PAUSE_MS,
  ONLINE_CHAT_BURST_LIMIT,
  ONLINE_CHAT_BURST_WINDOW_MS,
  ONLINE_CHAT_HISTORY_SIZE,
  ONLINE_CHAT_PERSIST_MS,
  ONLINE_CHAT_RATE_LIMIT,
  ONLINE_CHAT_RATE_LIMIT_ERROR,
  ONLINE_CHAT_RATE_WINDOW_MS,
  ONLINE_FORCE_RESULTS_MS,
  ONLINE_LEADERBOARD_PUBLISH_MS,
  ONLINE_MAX_CHAT_LENGTH,
  ONLINE_MAX_NAME_LENGTH,
  ONLINE_MAX_TOLERANCE,
  ONLINE_MIN_PLAYERS,
  ONLINE_MIN_TOLERANCE,
  ONLINE_READINESS_TIMEOUT_MS,
  ONLINE_RECONNECT_GRACE_MS,
  ONLINE_RESUME_COUNTDOWN_MS,
  ONLINE_ROOM_TTL_MS,
  ONLINE_START_LEAD_MS,
  ONLINE_STATS_PUBLISH_MS,
} from '~/modules/online/protocol/consts';
import {
  ChartManifest,
  ChatMessage,
  OnlineFinalResult,
  OnlineParticipant,
  OnlinePlaybackStatus,
  OnlineRoomState,
  OnlineSubscriptionChannels,
  PlayersStats,
  RoomScores,
  SongHoverPreview,
  SongVote,
  SongVotes,
  WireDetailedScore,
} from '~/modules/online/protocol/types';
import { ONLINE_MAX_PLAYERS, PlayerNumber } from '~/modules/players/player-number';

/** Fields added after the first release — blobs still in storage predate them, so they stay optional. */
type LatePersistedField =
  | 'roomCode'
  | 'chartPreview'
  | 'bannedIds'
  | 'created'
  | 'chat'
  | 'readinessDeadline'
  | 'playbackAnchor'
  | 'pause'
  | 'resumeCountdownEndsAt'
  | 'finishRequestedAt'
  | 'roomScores';

/**
 * The hibernation payload, derived from `OnlineRoomLogic.snapshot()` so the type cannot drift
 * from the value actually written: adding a field to the snapshot adds it here automatically.
 */
export type OnlinePersistedState = Omit<RoomSnapshot, LatePersistedField> &
  Partial<Pick<RoomSnapshot, LatePersistedField>>;

/** Everything the room logic needs from its host environment (PartyKit room or a test harness). */
export interface OnlineRoomDeps {
  roomCode: string;
  now: () => number;
  /** The room directory's host epoch, published so clients can carry it into a promotion claim.
   * A function rather than a value because the host bumps it when it takes over mid-life. */
  hostEpoch?: () => number;
  /** Push data to all subscribers of a channel. */
  publish: (channel: keyof OnlineSubscriptionChannels, data: unknown) => void;
  /** Persist state so the room survives hibernation/restarts. Fire-and-forget. */
  persist: (state: OnlinePersistedState) => void;
  /** Wake the room at this absolute time — the earliest pending deadline across the TTL and every
   * reconnect grace window, or null when nothing is pending. Backed by the room's single alarm, so
   * unlike `setTimeout` these survive hibernation: a quiet room with nobody sending anything still
   * gets woken to expire a grace window. */
  scheduleWake: (deadline: number | null) => void;
  /** Wipe the room — its TTL ran out. */
  destroy?: () => void;
  setTimeout?: (callback: () => void, delayMs: number) => unknown;
  clearTimeout?: (handle: unknown) => void;
  /** Forcibly close a participant's connection(s). */
  disconnect?: (participantId: string) => void;
}

export type JoinResult = { accepted: true } | { accepted: false; reason: 'room-full' | 'banned' | 'not-found' };

export class OnlineRoomLogic {
  private participants: OnlineParticipant[] = [];
  private nextJoinOrder = 0;
  private hostId: string | null = null;
  private tolerance = 2;
  private phase: OnlineRoomState['phase'] = 'lobby';
  private chart: ChartManifest | null = null;
  private chartData: string | null = null;
  private chartPreview: SongHoverPreview | null = null;
  private readinessDeadline: number | null = null;
  private playbackAnchor: OnlineRoomState['playbackAnchor'] = null;
  private pause: OnlineRoomState['pause'] = null;
  private resumeCountdownEndsAt: number | null = null;
  private leaderboard: OnlineRoomState['leaderboard'] = [];
  /** Standings across every song of this room — see `bankSongScores`. */
  private roomScores: RoomScores = {};
  private finalResults: OnlineFinalResult[] | null = null;
  private lastActivityAt: number;
  private bannedIds: string[] = [];
  private created = false;
  private finishRequestedAt: number | null = null;
  /** Lobby chat, oldest first. Persisted (and so handed to a successor host) because a chat that
   * empties itself every time the host's tab navigates would read as a bug. */
  private chat: ChatMessage[] = [];
  /** In-memory only — send times per participant, for the rate limit. A host takeover resets
   * these: the successor has never seen the previous host's traffic, and a spammer timing their
   * burst to land on a handover is not a threat worth persisting a window for. */
  private chatRateWindow = new Map<string, number[]>();
  /** In-memory only — votes on the currently browsed song, not worth persisting. */
  private songVotes: SongVotes = {};
  /** In-memory only — live ping/volume snapshots per participant. */
  private playerStats: PlayersStats = {};
  /** In-memory only, deliberately NOT part of the published room state (see `handlePlaybackStatus`) —
   * it changes far too often to broadcast, and nothing needs to react to it remotely yet. */
  private playback: Record<string, OnlinePlaybackStatus> = {};

  private timers = new Map<string, unknown>();

  /** Absolute deadlines that must outlive hibernation, keyed by name ('ttl', `grace:<id>`). The
   * room has exactly one alarm, so these are multiplexed: `scheduleWake` always gets the earliest,
   * and `handleAlarm` fires everything due and re-arms for the next. Rebuilt on restore from the
   * persisted `lastActivityAt` and `graceDeadline`s, so a wake never loses one. */
  private wakeDeadlines = new Map<string, number>();
  /** Last value handed to `deps.scheduleWake`, so an unchanged earliest deadline doesn't re-arm. */
  private lastScheduledWake: number | null = null;

  constructor(
    private readonly deps: OnlineRoomDeps,
    restoreFrom?: OnlinePersistedState,
    // Connection ids of sockets that are verifiably still attached right now — passed by the host
    // so a hibernation wake (constructor reruns while some clients never actually disconnected)
    // can be told apart from a genuine restart (every previous connection is gone).
    liveParticipantIds: ReadonlySet<string> = new Set(),
  ) {
    this.lastActivityAt = deps.now();
    if (restoreFrom) {
      // A hibernation wake, not a genuine restart, when at least one previously-known participant
      // still has a live socket. Everyone else in that case did disconnect for real during the gap
      // and gets the normal grace-timer treatment below.
      const isHibernationWake = restoreFrom.participants.some((participant) => liveParticipantIds.has(participant.id));

      this.participants = restoreFrom.participants.map((participant) => {
        const connected = liveParticipantIds.has(participant.id);
        return {
          ...participant,
          connected,
          // The readiness confirmation only carries over for someone who never actually left.
          ready: connected ? participant.ready : false,
          graceDeadline: connected ? null : (participant.graceDeadline ?? null),
        };
      });
      this.nextJoinOrder = restoreFrom.nextJoinOrder;
      this.hostId = restoreFrom.hostId;
      this.tolerance = restoreFrom.tolerance;
      this.chart = restoreFrom.chart;
      this.chartData = restoreFrom.chartData;
      this.chartPreview = restoreFrom.chartPreview ?? null;
      this.leaderboard = restoreFrom.leaderboard;
      this.roomScores = restoreFrom.roomScores ?? {};
      this.finalResults = restoreFrom.finalResults;
      this.lastActivityAt = restoreFrom.lastActivityAt;
      this.bannedIds = restoreFrom.bannedIds ?? [];
      this.created = restoreFrom.created ?? true;
      this.chat = restoreFrom.chat ?? [];

      if (isHibernationWake) {
        // Resume exactly where the room left off — 'readiness'/'singing' timers and the playback
        // anchor are re-derived from the persisted absolute deadlines below (rearmTimers), so
        // nobody watching notices the party ever went away.
        this.phase = restoreFrom.phase;
        this.readinessDeadline = restoreFrom.readinessDeadline ?? null;
        this.playbackAnchor = restoreFrom.playbackAnchor ?? null;
        this.pause = restoreFrom.pause ?? null;
        this.resumeCountdownEndsAt = restoreFrom.resumeCountdownEndsAt ?? null;
        this.finishRequestedAt = restoreFrom.finishRequestedAt ?? null;
        this.rearmTimers();
      } else {
        // Nobody is here — a genuine restart. 'readiness'/'singing' depend on live timers and a
        // playback anchor that nothing is driving anymore with every connection gone, so land
        // back in the lobby. 'lobby' and 'results' need no such live state, so they carry over.
        this.phase = restoreFrom.phase === 'readiness' || restoreFrom.phase === 'singing' ? 'lobby' : restoreFrom.phase;
      }

      // Anyone not currently live needs a grace timer, or they'd never be cleaned up (or free
      // their spot/host role) if they never come back. Reuses the remaining time on an
      // already-ticking window (persisted above) rather than granting a fresh
      // ONLINE_RECONNECT_GRACE_MS on every wake — otherwise a room that keeps hibernating while
      // someone else is still around would never actually expire a genuinely dropped participant.
      const now = this.deps.now();
      this.participants.forEach((participant) => {
        if (participant.connected) return;
        const deadline = participant.graceDeadline ?? now + ONLINE_RECONNECT_GRACE_MS;
        participant.graceDeadline = deadline;
        this.setWake(`grace:${participant.id}`, deadline);
      });
      // The TTL deadline has to be back in the map before anything else touches it: `syncWake`
      // picks the earliest of what it can see, so a missing 'ttl' would let a grace expiry cancel
      // the room's cleanup alarm outright.
      this.setWake('ttl', this.lastActivityAt + ONLINE_ROOM_TTL_MS);
    }
  }

  // --- hibernation-safe wakes (the room's single alarm, multiplexed) ---

  private setWake = (name: string, deadline: number) => {
    this.wakeDeadlines.set(name, deadline);
    this.syncWake();
  };

  private clearWake = (name: string) => {
    if (this.wakeDeadlines.delete(name)) this.syncWake();
  };

  private syncWake = () => {
    const deadlines = [...this.wakeDeadlines.values()];
    const earliest = deadlines.length ? Math.min(...deadlines) : null;
    if (earliest === this.lastScheduledWake) return;
    this.lastScheduledWake = earliest;
    this.deps.scheduleWake(earliest);
  };

  /**
   * The room's alarm fired: run every deadline that is due and re-arm for the next one. Called by
   * the host on `onAlarm`, which is the only thing that wakes a hibernated room nobody is talking
   * to — grace windows would otherwise never expire once the clients go idle.
   */
  public handleAlarm = () => {
    const now = this.deps.now();
    // Snapshot the due names first: expiring one deadline republishes state and can add or drop
    // others (a removed participant re-elects the host, a publish touches the TTL).
    const due = [...this.wakeDeadlines].filter(([, deadline]) => deadline <= now).map(([name]) => name);
    for (const name of due) {
      if (!this.wakeDeadlines.has(name)) continue;
      this.wakeDeadlines.delete(name);
      if (name === 'ttl') {
        // The TTL means abandoned, not merely quiet. Neither pings nor stats reports touch the
        // room's state (only `publishState` does), so a lobby full of idle singers lets the
        // deadline come due with everyone still sitting in it — and wiping storage out from under
        // live sockets would evaporate the room on its next hibernation wake. `isExpired` is the
        // one place that rule lives.
        if (!this.isExpired()) {
          this.touch();
          continue;
        }
        // Nothing left to re-arm — the room and its alarm go away with the storage.
        this.deps.destroy?.();
        return;
      }
      if (name.startsWith('grace:')) this.expireGrace(name.slice('grace:'.length));
    }
    this.syncWake();
  };

  // --- timers ---

  private setTimer = (name: string, delayMs: number, callback: () => void) => {
    this.clearTimer(name);
    const set = this.deps.setTimeout ?? ((cb: () => void, ms: number) => setTimeout(cb, ms));
    this.timers.set(name, set(callback, delayMs));
  };

  private clearTimer = (name: string) => {
    if (this.timers.has(name)) {
      const clear = this.deps.clearTimeout ?? ((handle: unknown) => clearTimeout(handle as never));
      clear(this.timers.get(name));
      this.timers.delete(name);
    }
  };

  /** Re-arms the timers a hibernation wake dropped, from the persisted absolute deadlines —
   * called only when the constructor determined this is a wake (see `isHibernationWake`), never
   * for a genuine restart. Deadlines already in the past fire on the next tick rather than being
   * skipped, so a wake that took a while still lands the transition it was mid-flight on. */
  private rearmTimers = () => {
    const now = this.deps.now();
    if (this.phase === 'readiness' && this.readinessDeadline !== null) {
      this.setTimer('readiness', Math.max(0, this.readinessDeadline - now), this.beginPlayback);
    }
    if (this.phase === 'singing' && this.resumeCountdownEndsAt !== null) {
      this.setTimer('resume', Math.max(0, this.resumeCountdownEndsAt - now), this.finishResume);
    }
    if (this.finishRequestedAt !== null && (this.phase === 'singing' || this.phase === 'readiness')) {
      this.setTimer(
        'force-results',
        Math.max(0, this.finishRequestedAt + ONLINE_FORCE_RESULTS_MS - now),
        this.forceResults,
      );
    }
  };

  // --- state snapshot / publishing ---

  /**
   * The state pushed to clients. Wider than what is persisted (see `snapshot`): the mid-song
   * bookkeeping — `readinessDeadline`, `playbackAnchor`, `pause`, `resumeCountdownEndsAt` and
   * `finishRequestedAt` — is deliberately transient, as it is only meaningful while the timers
   * backing it are alive and those do not survive hibernation. `roomCode` comes from the deps
   * rather than from state, and `songVotes`/`playerStats` are in-memory only and not part of the
   * room state at all. Arrays are cloned here because this leaves the room; `snapshot` hands the
   * live references over to the storage layer.
   */
  public getState = (): OnlineRoomState => ({
    roomCode: this.deps.roomCode,
    phase: this.phase,
    participants: this.participants.map((participant) => ({ ...participant })),
    hostId: this.hostId,
    tolerance: this.tolerance,
    chart: this.chart,
    readinessDeadline: this.readinessDeadline,
    playbackAnchor: this.playbackAnchor,
    pause: this.pause,
    resumeCountdownEndsAt: this.resumeCountdownEndsAt,
    finishRequestedAt: this.finishRequestedAt,
    leaderboard: [...this.leaderboard],
    roomScores: { ...this.roomScores },
    finalResults: this.finalResults ? [...this.finalResults] : null,
    hostEpoch: this.deps.hostEpoch?.() ?? 0,
  });

  /**
   * Everything the room needs to come back after a restart, in one place — `OnlinePersistedState`
   * is derived from this method, so a field can never be persisted without being in the type or
   * declared in the type without being written. Public (rather than private) only because a
   * private member cannot be reached by the `ReturnType<…>` that derives the type.
   */
  public snapshot = () => ({
    /** Persisted because `Party.id` is not readable in an alarm context — the alarm handler has to
     * rebuild the room from storage alone. */
    roomCode: this.deps.roomCode,
    participants: this.participants,
    nextJoinOrder: this.nextJoinOrder,
    hostId: this.hostId,
    tolerance: this.tolerance,
    phase: this.phase,
    chart: this.chart,
    /** Compressed (gzip+base64) chart payload, served as-is to (late-)joining clients. */
    chartData: this.chartData,
    /** Preview (video/details) of the selected chart, shown in every lobby. */
    chartPreview: this.chartPreview,
    leaderboard: this.leaderboard,
    /** Persisted so a takeover or a hibernation wake doesn't reset the running totals. */
    roomScores: this.roomScores,
    finalResults: this.finalResults,
    lastActivityAt: this.lastActivityAt,
    /** Participants kicked by the host — they cannot rejoin this room. */
    bannedIds: this.bannedIds,
    /** True once someone explicitly opened (created) this room. */
    created: this.created,
    /** Lobby chat history — the successor picks the conversation up where it was left. */
    chat: this.chat,
    /** Mid-song bookkeeping, persisted only so a hibernation wake (see the constructor) can
     * resume a phase in progress from its absolute deadlines — a genuine restart discards these
     * regardless of what is stored here. */
    readinessDeadline: this.readinessDeadline,
    playbackAnchor: this.playbackAnchor,
    pause: this.pause,
    resumeCountdownEndsAt: this.resumeCountdownEndsAt,
    finishRequestedAt: this.finishRequestedAt,
  });

  /**
   * Marks the room as alive, pushing its TTL out.
   *
   * `persist: false` keeps the deadline bookkeeping but skips writing the snapshot, for activity
   * that happens often and can afford to be a little behind. Chat is the only caller: the whole
   * history is in the snapshot, and in a P2P room `deps.persist` broadcasts that snapshot to the
   * succession line immediately — so persisting per message would put a hundred lines of chat on
   * the wire for every one line sent, which is exactly what publishing only the newest message
   * avoids. The regular ONLINE_SNAPSHOT_BROADCAST_MS rebroadcast carries it instead, and a
   * takeover loses at most that much of the conversation.
   */
  private touch = ({ persist = true }: { persist?: boolean } = {}) => {
    this.lastActivityAt = this.deps.now();
    this.setWake('ttl', this.lastActivityAt + ONLINE_ROOM_TTL_MS);
    if (persist) this.deps.persist(this.snapshot());
  };

  private publishState = () => {
    this.touch();
    this.deps.publish('room-state', this.getState());
  };

  private publishLeaderboard = () => {
    this.deps.publish('leaderboard', [...this.leaderboard]);
  };

  private publishStats = () => {
    this.deps.publish('player-stats', { ...this.playerStats });
  };

  /**
   * Leading + trailing throttle: the first update goes out immediately, everything that arrives
   * during the cooldown is coalesced into a single publish when it ends — and the cooldown keeps
   * restarting for as long as updates keep coming.
   */
  private createCoalescedPublisher = (timerName: string, intervalMs: number, publish: () => void) => {
    let dirty = false;
    const startCooldown = () => {
      this.setTimer(timerName, intervalMs, () => {
        this.timers.delete(timerName);
        if (dirty) {
          dirty = false;
          publish();
          startCooldown();
        }
      });
    };
    return () => {
      if (this.timers.has(timerName)) {
        dirty = true;
        return;
      }
      publish();
      startCooldown();
    };
  };

  // Score snapshots arrive from every singer — coalesce broadcasts so subscribers get at most
  // one leaderboard update per ONLINE_LEADERBOARD_PUBLISH_MS.
  private queueLeaderboardPublish = this.createCoalescedPublisher(
    'leaderboard-throttle',
    ONLINE_LEADERBOARD_PUBLISH_MS,
    this.publishLeaderboard,
  );

  /** Chat messages arrive faster than the room should write itself out — see
   * ONLINE_CHAT_PERSIST_MS for why this is neither per-message nor skipped entirely. The leading
   * edge fires immediately, so a single message in a quiet room is written at once rather than
   * waiting for a second one that may never come. */
  private queueChatPersist = this.createCoalescedPublisher('chat-persist', ONLINE_CHAT_PERSIST_MS, () =>
    this.deps.persist(this.snapshot()),
  );

  // Ping/volume snapshots arrive continuously from every singer — same coalescing as scores.
  private queueStatsPublish = this.createCoalescedPublisher(
    'stats-throttle',
    ONLINE_STATS_PUBLISH_MS,
    this.publishStats,
  );

  // --- participants ---

  private getParticipant = (id: string) => this.participants.find((participant) => participant.id === id);

  private requireParticipant = (id: string): OnlineParticipant => {
    const participant = this.getParticipant(id);
    if (!participant) {
      throw new Error('Not a participant of this room');
    }
    return participant;
  };

  private connectedParticipants = () => this.participants.filter((participant) => participant.connected);

  private freePlayerNumber = (): PlayerNumber => {
    const taken = this.participants.map((participant) => participant.playerNumber);
    for (let i = 0; i < ONLINE_MAX_PLAYERS; i++) {
      if (!taken.includes(i as PlayerNumber)) return i as PlayerNumber;
    }
    throw new Error('No free player number');
  };

  private electHost = () => {
    const connected = this.connectedParticipants();
    const currentHostExists = this.hostId !== null && this.getParticipant(this.hostId) !== undefined;
    if (!currentHostExists || !connected.some((participant) => participant.id === this.hostId)) {
      this.hostId = connected.sort((a, b) => a.joinOrder - b.joinOrder)[0]?.id ?? this.hostId;
    }
    if (this.hostId !== null && this.getParticipant(this.hostId) === undefined) {
      this.hostId = null;
    }
  };

  public handleConnect = (id: string, name: string, { create = false } = {}): JoinResult => {
    if (this.bannedIds.includes(id)) {
      return { accepted: false, reason: 'banned' };
    }
    // Rooms are only entered explicitly: joining a code that was never opened is an error,
    // it must not silently create a new room
    if (!this.created) {
      if (!create) {
        return { accepted: false, reason: 'not-found' };
      }
      this.created = true;
    }

    const existing = this.getParticipant(id);
    if (existing) {
      existing.connected = true;
      existing.graceDeadline = null;
      if (name) existing.name = name;
      this.clearWake(`grace:${id}`);
      // A returning earlier-joined participant may reclaim the host role
      this.electHost();
      this.publishState();
      return { accepted: true };
    }

    if (this.participants.length >= ONLINE_MAX_PLAYERS) {
      return { accepted: false, reason: 'room-full' };
    }

    this.participants.push({
      id,
      name: name || `Singer ${this.participants.length + 1}`,
      joinOrder: this.nextJoinOrder++,
      playerNumber: this.freePlayerNumber(),
      connected: true,
      ready: false,
      graceDeadline: null,
    });
    this.playback[id] = 'unstarted';
    if (this.hostId === null) {
      this.hostId = id;
    }
    this.publishState();
    return { accepted: true };
  };

  public handleDisconnect = (id: string) => {
    const participant = this.getParticipant(id);
    if (!participant?.connected) return;
    participant.connected = false;
    participant.graceDeadline = this.deps.now() + ONLINE_RECONNECT_GRACE_MS;

    // Keep the spot (and the host role) during the grace window so refreshes don't reshuffle the room
    this.setWake(`grace:${id}`, participant.graceDeadline);
    this.publishState();
  };

  private expireGrace = (id: string) => {
    const participant = this.getParticipant(id);
    if (!participant || participant.connected) return;
    this.removeParticipant(id);
  };

  private removeParticipant = (id: string) => {
    this.clearWake(`grace:${id}`);
    this.participants = this.participants.filter((other) => other.id !== id);
    this.leaderboard = this.leaderboard.filter((entry) => entry.participantId !== id);
    // Leaving for good resets the score — whoever takes the seat next is a different singer
    delete this.roomScores[id];
    delete this.songVotes[id];
    delete this.playerStats[id];
    delete this.playback[id];
    this.electHost();

    if (this.phase === 'readiness') {
      // One fewer singer to wait for — that may be the last one holding the song up
      this.checkReadiness();
    } else if (this.phase === 'singing') {
      this.checkAllFinished();
    }
    this.publishState();
    this.publishLeaderboard();
  };

  // --- readiness ---

  /**
   * The host starting the song doesn't start playback — it moves the room to the readiness phase,
   * where every singer's device loads the video (held, not playing) and shows the confirmation.
   * The song rolls once everyone has confirmed, or when the autostart deadline runs out.
   */
  private startReadiness = () => {
    this.phase = 'readiness';
    this.participants.forEach((participant) => {
      participant.ready = false;
      this.playback[participant.id] = 'unstarted';
    });
    this.readinessDeadline = this.deps.now() + ONLINE_READINESS_TIMEOUT_MS;
    this.leaderboard = this.connectedParticipants().map((participant) => ({
      participantId: participant.id,
      name: participant.name,
      playerNumber: participant.playerNumber,
      score: 0,
    }));
    this.finalResults = null;
    this.finishRequestedAt = null;
    this.setTimer('readiness', ONLINE_READINESS_TIMEOUT_MS, this.beginPlayback);
    this.publishState();
    this.publishLeaderboard();
  };

  private checkReadiness = () => {
    if (this.phase !== 'readiness') return;
    const connected = this.connectedParticipants();
    if (connected.length === 0 || !connected.every((participant) => participant.ready)) return;
    this.beginPlayback();
  };

  private beginPlayback = () => {
    if (this.phase !== 'readiness') return;
    this.clearTimer('readiness');
    this.readinessDeadline = null;
    this.phase = 'singing';
    // Anchored slightly ahead so every client can schedule its own play() against the same instant
    this.playbackAnchor = { serverTimeMs: this.deps.now() + ONLINE_START_LEAD_MS, videoTimeMs: 0 };
    this.publishState();
  };

  /** Expected video position right now (ms); null when not anchored (paused / not started). */
  private expectedVideoTime = (): number | null => {
    if (this.playbackAnchor === null) return null;
    return Math.max(0, this.playbackAnchor.videoTimeMs + (this.deps.now() - this.playbackAnchor.serverTimeMs));
  };

  // --- playback / pausing ---

  private pausePlayback = (byId: string, reason: 'manual' | 'buffering') => {
    if (this.phase !== 'singing' || this.pause !== null) return;
    const participant = this.requireParticipant(byId);
    this.pause = {
      participantId: participant.id,
      name: participant.name,
      reason,
      videoTimeMs: this.expectedVideoTime() ?? 0,
    };
    this.playbackAnchor = null;
    this.resumeCountdownEndsAt = null;
    this.clearTimer('resume');
    this.clearTimer('buffering');
    this.publishState();
  };

  private finishResume = () => {
    this.playbackAnchor = {
      serverTimeMs: this.resumeCountdownEndsAt!,
      videoTimeMs: this.pause?.videoTimeMs ?? 0,
    };
    this.pause = null;
    this.resumeCountdownEndsAt = null;
    this.publishState();
  };

  private resumePlayback = () => {
    if (this.phase !== 'singing' || this.pause === null || this.resumeCountdownEndsAt !== null) return;
    this.resumeCountdownEndsAt = this.deps.now() + ONLINE_RESUME_COUNTDOWN_MS;
    this.setTimer('resume', ONLINE_RESUME_COUNTDOWN_MS, this.finishResume);
    this.publishState();
  };

  private handlePlaybackStatus = (id: string, status: OnlinePlaybackStatus) => {
    this.requireParticipant(id);
    this.playback[id] = status;

    const anyBuffering = this.connectedParticipants().some((other) => this.playback[other.id] === 'buffering');

    if (this.phase === 'singing' && this.pause === null) {
      if (status === 'buffering') {
        // Only pause everyone when the stall lasts longer than the configured threshold
        if (!this.timers.has('buffering')) {
          this.setTimer('buffering', ONLINE_BUFFERING_PAUSE_MS, () => {
            const stillBuffering = this.connectedParticipants().find(
              (other) => this.playback[other.id] === 'buffering',
            );
            if (stillBuffering && this.phase === 'singing' && this.pause === null) {
              this.pausePlayback(stillBuffering.id, 'buffering');
            }
          });
        }
      } else if (!anyBuffering) {
        this.clearTimer('buffering');
      }
    }

    // Auto-resume a buffering pause once every connected singer reports playable again.
    // Plain status updates are NOT broadcast — they arrive constantly during playback, `playback`
    // is intentionally excluded from the published room state (see the field's doc comment), and
    // re-publishing the whole room state for each one would flood every client.
    if (this.pause?.reason === 'buffering' && !anyBuffering && this.resumeCountdownEndsAt === null) {
      this.resumePlayback();
    }
  };

  /**
   * Everything a phase change has to unwind, grouped into the three things that can be in flight:
   * the playback anchor (with its pause/resume bookkeeping), the readiness countdown and the
   * host's end-game request. The call sites clear different subsets — each difference is an
   * explicit `keep*` flag rather than a silent omission, so it is visible from the call which
   * state a transition leaves standing on purpose.
   */
  private resetPlayback = ({ keepAnchor = false, keepReadiness = false, keepFinishRequest = false } = {}) => {
    if (!keepAnchor) {
      this.playbackAnchor = null;
      this.pause = null;
      this.resumeCountdownEndsAt = null;
      this.clearTimer('resume');
      this.clearTimer('buffering');
    }
    if (!keepReadiness) {
      this.readinessDeadline = null;
      this.clearTimer('readiness');
    }
    if (!keepFinishRequest) {
      this.finishRequestedAt = null;
      this.clearTimer('force-results');
    }
  };

  // --- scoring / results ---

  private checkAllFinished = () => {
    if (this.phase !== 'singing' || this.finalResults === null) return;
    const connected = this.connectedParticipants();
    if (
      connected.length > 0 &&
      connected.every((participant) => this.finalResults!.some((result) => result.participantId === participant.id))
    ) {
      this.enterResults();
    }
  };

  /** Adds the finished song to the room's standings, read off the leaderboard everyone watched.
   * Rebuilt rather than added to, so `lastSong` empties for anyone the song passed by. */
  private bankSongScores = () => {
    const banked: RoomScores = {};
    this.participants.forEach((participant) => {
      const previous = this.roomScores[participant.id];
      const entry = this.leaderboard.find((other) => other.participantId === participant.id);
      const lastSong = entry ? entry.score : null;
      // Nothing to remember yet for someone who has sung neither this song nor an earlier one.
      if (lastSong === null && previous === undefined) return;
      banked[participant.id] = { total: (previous?.total ?? 0) + (lastSong ?? 0), lastSong };
    });
    this.roomScores = banked;
  };

  private enterResults = () => {
    // A song ended during readiness was never sung — its all-zero leaderboard is not a result
    if (this.phase === 'singing') this.bankSongScores();
    this.phase = 'results';
    // The readiness deadline/timer are left standing — results can be entered straight out of
    // readiness (a forced end) and this transition has never cleared them. The timer is inert
    // outside the readiness phase (beginPlayback bails), but readinessDeadline stays in the
    // published state for the duration of the results.
    this.resetPlayback({ keepReadiness: true });
  };

  /** After the host ends the game, singers that never published a final score get one
   * fabricated from their last leaderboard snapshot so the results can still be shown. The room
   * has no notion of the chart's actual max achievable score (that lives in the game engine, not
   * in this protocol — see WireDetailedScore's doc comment), so it cannot fabricate a meaningful
   * achieved/max ratio; `incomplete: true` tells consumers not to render this as a real run. */
  private forceResults = () => {
    if (this.phase !== 'singing' && this.phase !== 'readiness') return;
    this.finalResults = this.finalResults ?? [];
    this.connectedParticipants().forEach((participant) => {
      if (this.finalResults!.some((result) => result.participantId === participant.id)) return;
      const score = this.leaderboard.find((entry) => entry.participantId === participant.id)?.score ?? 0;
      this.finalResults!.push({
        participantId: participant.id,
        name: participant.name,
        playerNumber: participant.playerNumber,
        detailedScore: [{ normal: score }, { normal: Math.max(score, 1) }],
        incomplete: true,
      });
    });
    this.enterResults();
    this.publishState();
  };

  private returnToLobby = () => {
    this.phase = 'lobby';
    this.resetPlayback();
    this.finalResults = null;
    this.leaderboard = [];
    // The finished song is done — the next round starts with a fresh selection
    this.chart = null;
    this.chartData = null;
    this.chartPreview = null;
    this.songVotes = {};
    this.participants.forEach((participant) => {
      participant.ready = false;
      this.playback[participant.id] = 'unstarted';
    });
    this.publishState();
    this.publishLeaderboard();
    this.deps.publish('song-preview', null);
    this.deps.publish('song-votes', {});
  };

  private requireHost = (senderId: string) => {
    if (senderId !== this.hostId) {
      throw new Error('Only the host can do that');
    }
  };

  // --- chat ---

  /**
   * What a message looks like once the room is done with it.
   *
   * The input caps typing at ONLINE_MAX_CHAT_LENGTH and cannot produce a newline, so none of this
   * fires for our own client — it is here because the wire is open to any client at all.
   *
   * Order matters. Newlines and tabs become spaces *before* the remaining control characters are
   * dropped, so "one\ntwo" reads as "one two" rather than "onetwo". The cut is by code point
   * (`[...text]`) rather than `slice`, which counts UTF-16 units and would leave half a surrogate
   * pair — a broken glyph — at the limit. Trimming is last so a message of nothing but spaces
   * collapses to empty here rather than surviving as a blank line.
   */
  private normalizeChatText = (text: string): string =>
    [...String(text ?? '').replace(/[\r\n\t\v\f]+/g, ' ')]
      .filter((character) => {
        const code = character.codePointAt(0)!;
        // C0 and C1 control ranges. Whatever in here carried meaning (newlines, tabs) has already
        // become a space above; the rest only ever arrives to confuse a renderer.
        return !(code <= 0x1f || (code >= 0x7f && code <= 0x9f));
      })
      .slice(0, ONLINE_MAX_CHAT_LENGTH)
      .join('')
      .trim();

  /**
   * Records a send and reports whether it was over either limit.
   *
   * Two windows, because they catch different things: the minute-long one is the sustained budget,
   * and the five-second one stops that whole budget being spent at once. The check is a plain
   * sliding window of send times — nothing is recorded when a message is refused, so being
   * throttled cannot itself extend the throttle.
   */
  private chatRateLimitExceeded = (participantId: string): boolean => {
    const now = this.deps.now();
    const sends = (this.chatRateWindow.get(participantId) ?? []).filter((at) => now - at < ONLINE_CHAT_RATE_WINDOW_MS);
    const burst = sends.filter((at) => now - at < ONLINE_CHAT_BURST_WINDOW_MS);
    if (sends.length >= ONLINE_CHAT_RATE_LIMIT || burst.length >= ONLINE_CHAT_BURST_LIMIT) {
      // Still write the pruned window back — otherwise a participant who keeps hitting the limit
      // never drops their expired entries and stays throttled past the window.
      this.chatRateWindow.set(participantId, sends);
      return true;
    }
    this.chatRateWindow.set(participantId, [...sends, now]);
    return false;
  };

  /**
   * The id a message will carry, namespaced to its author.
   *
   * The client proposes the second half so that it can match the room's copy to the line it
   * already drew optimistically — the accepted message is broadcast before this call's response is
   * sent, so the echo usually arrives first and there is nothing else to recognise it by.
   *
   * The author half is taken from the participant the room resolved, never from the request, which
   * is what stops a client naming somebody else's message. Without it a client could reuse an id
   * that has aged out of the room's history but is still on screen somewhere, and replace that
   * line in place on every client still holding it. Scoped this way the worst it can do is
   * overwrite one of its own.
   */
  private uniqueChatId = (authorId: string, proposed: unknown): string => {
    // Bounded and stripped to id-shaped characters: it is echoed to every client and used as a
    // React key, so it has no business carrying arbitrary text.
    const suffix = typeof proposed === 'string' ? proposed.slice(0, 64).replace(/[^\w-]/g, '') : '';
    const candidate = suffix ? `${authorId}:${suffix}` : '';
    if (!candidate || this.chat.some((message) => message.id === candidate)) return `${authorId}:${uuid()}`;
    return candidate;
  };

  // --- RPC handlers ---

  public createHandlers = () => ({
    room: {
      getState: defineQuery(() => this.getState()),
      getServerTime: defineQuery(() => this.deps.now()),
      setName: defineMutation((ctx, name: string) => {
        const participant = this.requireParticipant(ctx.senderId);
        const trimmedName = name.trim().slice(0, ONLINE_MAX_NAME_LENGTH);
        participant.name = trimmedName || participant.name;
        this.leaderboard.forEach((entry) => {
          if (entry.participantId === participant.id) entry.name = participant.name;
        });
        this.publishState();
      }),
      /** Host only: leave the lobby for the readiness phase — no one else has to agree first. */
      startGame: defineMutation((ctx) => {
        this.requireHost(ctx.senderId);
        if (this.phase !== 'lobby') throw new Error('Can only start from the lobby');
        if (!this.chart) throw new Error('No song selected yet');
        // The lobby offers a lone host local mode instead; the same rule lives here too, where an
        // out-of-date client can't skip it.
        if (this.connectedParticipants().length < ONLINE_MIN_PLAYERS)
          throw new Error(`Online needs at least ${ONLINE_MIN_PLAYERS} singers — sing on your own in local mode`);
        this.startReadiness();
      }),
      /** Host only: call the start off (a singer is missing, wrong song) and go back to the lobby. */
      cancelStart: defineMutation((ctx) => {
        this.requireHost(ctx.senderId);
        if (this.phase !== 'readiness') throw new Error('Not starting a song');
        // Only the readiness countdown is unwound: a cancel can only come from 'readiness', where
        // the playback anchor is never set. An end-game requested during readiness is left
        // standing (this transition has never cleared it) — its force-results timer bails out
        // once the phase is back to 'lobby', but finishRequestedAt stays in the published state.
        this.resetPlayback({ keepAnchor: true, keepFinishRequest: true });
        this.phase = 'lobby';
        this.leaderboard = [];
        this.participants.forEach((participant) => {
          participant.ready = false;
        });
        this.publishState();
        this.publishLeaderboard();
      }),
      setReady: defineMutation((ctx, ready: boolean) => {
        if (this.phase !== 'readiness') throw new Error('Nothing to confirm readiness for');
        const participant = this.requireParticipant(ctx.senderId);
        participant.ready = ready;
        this.checkReadiness();
        this.publishState();
      }),
      /** Intentionally participant-accessible rather than host-only: once in results there's
       * nothing left to coordinate, so anyone can move the room on to the next round. */
      returnToLobby: defineMutation((ctx) => {
        this.requireParticipant(ctx.senderId);
        if (this.phase !== 'results') throw new Error('Not in results');
        this.returnToLobby();
      }),
      /** Host only: end the current game — everyone wraps up and the room moves to the results. */
      endGame: defineMutation((ctx) => {
        this.requireHost(ctx.senderId);
        if (this.phase !== 'singing' && this.phase !== 'readiness') throw new Error('No game in progress');
        this.finishRequestedAt = this.deps.now();
        // Clients publish their final scores in response; if some never do, force the results
        this.setTimer('force-results', ONLINE_FORCE_RESULTS_MS, this.forceResults);
        this.publishState();
      }),
      /** Report your connection latency and mic volume so others can see them. `idle` is sent once
       * on each transition when a singer stops reporting altogether (see `useIsUserActive`): the
       * room has no timer watching for stale entries — that would wake it, which is the whole
       * thing being avoided — so going quiet has to be stated rather than inferred. */
      reportStats: defineMutation((ctx, ping: number, volume: number, idle: boolean = false) => {
        this.requireParticipant(ctx.senderId);
        this.playerStats[ctx.senderId] = { ping: Math.round(ping), volume, idle };
        this.queueStatsPublish();
      }),
      /** Host only: remove a singer from the room and ban them from rejoining. */
      kickPlayer: defineMutation((ctx, participantId: string) => {
        this.requireHost(ctx.senderId);
        if (participantId === ctx.senderId) throw new Error('Cannot kick yourself');
        this.requireParticipant(participantId);
        if (!this.bannedIds.includes(participantId)) {
          this.bannedIds.push(participantId);
        }
        this.removeParticipant(participantId);
        this.deps.disconnect?.(participantId);
      }),
      /** Change your color — colors are tied to player numbers, one singer per color. */
      setPlayerNumber: defineMutation((ctx, desired: PlayerNumber) => {
        if (this.phase !== 'lobby') throw new Error('Can only change color in the lobby');
        if (!Number.isInteger(desired) || desired < 0 || desired >= ONLINE_MAX_PLAYERS) {
          throw new Error('Invalid color');
        }
        const participant = this.requireParticipant(ctx.senderId);
        const takenBy = this.participants.find((other) => other.playerNumber === desired);
        if (takenBy && takenBy.id !== participant.id) {
          throw new Error('Color already taken');
        }
        participant.playerNumber = desired;
        this.publishState();
      }),
    },
    selection: {
      setChart: defineMutation(
        async (ctx, manifest: ChartManifest, data: string, tolerance: number, preview?: SongHoverPreview | null) => {
          this.requireHost(ctx.senderId);
          if (this.phase !== 'lobby') throw new Error('Can only select a song in the lobby');
          if (!Number.isInteger(tolerance) || tolerance < ONLINE_MIN_TOLERANCE || tolerance > ONLINE_MAX_TOLERANCE) {
            throw new Error('Invalid tolerance');
          }
          // Validates decompression, length and hash against the manifest
          await unpackChartTransfer(manifest, data);
          // Re-check: another mutation may have moved the room out of the lobby while we awaited
          if (this.phase !== 'lobby') throw new Error('Can only select a song in the lobby');
          this.chart = manifest;
          this.chartData = data;
          this.chartPreview = preview ?? null;
          this.tolerance = tolerance;
          this.leaderboard = [];
          this.finalResults = null;
          this.songVotes = {};
          this.publishState();
          this.publishLeaderboard();
          // Keep the selected song visible (and previewable) for everyone in the lobby
          this.deps.publish('song-preview', this.chartPreview);
          this.deps.publish('song-votes', {});
        },
      ),
      /** Compressed chart payload — for (late-)joining clients; validate against state.chart. */
      getChart: defineQuery((): string => {
        if (!this.chart || this.chartData === null) throw new Error('No chart in the room');
        return this.chartData;
      }),
      /** Host's live browsing position — broadcast only, not part of the room state. */
      setPreview: defineMutation((ctx, preview: SongHoverPreview | null) => {
        this.requireHost(ctx.senderId);
        // When the host stops browsing, fall back to the selected song's preview (if any)
        this.deps.publish('song-preview', preview ?? this.chartPreview);
      }),
      /** Thumbs up/down on the song the host is browsing, so the host sees the room's mood. */
      voteSong: defineMutation((ctx, songId: string, vote: SongVote | null) => {
        this.requireParticipant(ctx.senderId);
        if (vote === null) {
          delete this.songVotes[ctx.senderId];
        } else {
          this.songVotes[ctx.senderId] = { songId, vote };
        }
        this.deps.publish('song-votes', { ...this.songVotes });
      }),
    },
    chat: {
      /**
       * Say something in the lobby. Deliberately available in every phase rather than only in the
       * lobby — the panel is only rendered there, but a message that arrives while the room is
       * mid-song is still a message, and refusing it by phase would mean a client that is a beat
       * behind loses what someone typed.
       */
      send: defineMutation((ctx, text: string, id: string): ChatMessage => {
        const participant = this.requireParticipant(ctx.senderId);
        const body = this.normalizeChatText(text);
        if (!body) throw new Error('Nothing to send');
        if (this.chatRateLimitExceeded(participant.id)) throw new Error(ONLINE_CHAT_RATE_LIMIT_ERROR);

        const message: ChatMessage = {
          id: this.uniqueChatId(participant.id, id),
          at: this.deps.now(),
          authorId: participant.id,
          authorName: participant.name,
          playerNumber: participant.playerNumber,
          text: body,
        };
        this.chat.push(message);
        // Oldest out first. Spliced in place rather than reassigned because `snapshot()` hands the
        // live array to the storage layer.
        if (this.chat.length > ONLINE_CHAT_HISTORY_SIZE) {
          this.chat.splice(0, this.chat.length - ONLINE_CHAT_HISTORY_SIZE);
        }
        // Chatting keeps the room alive; the write itself is coalesced rather than skipped, so a
        // room that hibernates right after a message still has it. See `queueChatPersist`.
        this.touch({ persist: false });
        this.queueChatPersist();
        this.deps.publish('chat', message);
        return message;
      }),
      /** The whole history, for a client that just joined. The channel only ever carries the
       * newest message, so this is the one place the backlog is handed out — and the one place
       * the whole conversation can be read in a single call, so it is gated on actually being in
       * the room rather than merely being able to reach it. */
      getHistory: defineQuery((ctx): ChatMessage[] => {
        this.requireParticipant(ctx.senderId);
        return [...this.chat];
      }),
    },
    playback: {
      pause: defineMutation((ctx) => {
        this.requireParticipant(ctx.senderId);
        if (this.phase !== 'singing') throw new Error('Not singing');
        if (this.pause !== null) return;
        this.pausePlayback(ctx.senderId, 'manual');
      }),
      resume: defineMutation((ctx) => {
        this.requireParticipant(ctx.senderId);
        if (this.phase !== 'singing' || this.pause === null) return;
        this.resumePlayback();
      }),
      reportStatus: defineMutation((ctx, status: OnlinePlaybackStatus) => {
        this.handlePlaybackStatus(ctx.senderId, status);
      }),
      /** Host-only authoritative seek (e.g. skip intro) — moves the anchor for everyone. */
      seek: defineMutation((ctx, videoTimeMs: number) => {
        this.requireHost(ctx.senderId);
        if (this.phase !== 'singing') throw new Error('Not singing');
        if (this.pause !== null) throw new Error('Cannot seek while paused');
        this.playbackAnchor = { serverTimeMs: this.deps.now(), videoTimeMs: Math.max(0, videoTimeMs) };
        this.publishState();
      }),
    },
    scoring: {
      publishScore: defineMutation((ctx, score: number) => {
        const participant = this.requireParticipant(ctx.senderId);
        if (this.phase !== 'singing' && this.phase !== 'readiness') return;
        const entry = this.leaderboard.find((other) => other.participantId === participant.id);
        if (entry) {
          entry.score = score;
        } else {
          this.leaderboard.push({
            participantId: participant.id,
            name: participant.name,
            playerNumber: participant.playerNumber,
            score,
          });
        }
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.queueLeaderboardPublish();
      }),
      publishFinal: defineMutation((ctx, detailedScore: WireDetailedScore) => {
        const participant = this.requireParticipant(ctx.senderId);
        if (this.phase !== 'singing') return;
        this.finalResults = this.finalResults ?? [];
        this.finalResults = this.finalResults.filter((result) => result.participantId !== participant.id);
        this.finalResults.push({
          participantId: participant.id,
          name: participant.name,
          playerNumber: participant.playerNumber,
          detailedScore,
        });
        this.checkAllFinished();
        this.publishState();
      }),
    },
  });

  /** True once someone explicitly opened this room (join attempts before that are rejected). */
  public isCreated = () => this.created;

  /** Preview of the currently selected chart, for channel replay to late subscribers. */
  public getChartPreview = () => this.chartPreview;

  /** True when the room can be wiped by the TTL alarm. */
  public isExpired = () =>
    this.connectedParticipants().length === 0 && this.deps.now() - this.lastActivityAt >= ONLINE_ROOM_TTL_MS;

  public getLastActivityAt = () => this.lastActivityAt;
}

type RoomSnapshot = ReturnType<OnlineRoomLogic['snapshot']>;

export type OnlineHandlers = ReturnType<OnlineRoomLogic['createHandlers']>;
export type OnlineServerRpc = ExtractContract<OnlineHandlers>;
