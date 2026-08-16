import { defineMutation, defineQuery } from '~/modules/network/rpc/define';
import { ExtractContract } from '~/modules/network/rpc/types';
import { ONLINE_MAX_PLAYERS, PlayerNumber } from '~/modules/players/player-number';

import { unpackChartTransfer } from './chart-transfer';
import {
  ONLINE_BUFFERING_PAUSE_MS,
  ONLINE_FORCE_RESULTS_MS,
  ONLINE_LEADERBOARD_PUBLISH_MS,
  ONLINE_READINESS_TIMEOUT_MS,
  ONLINE_RECONNECT_GRACE_MS,
  ONLINE_RESUME_COUNTDOWN_MS,
  ONLINE_ROOM_TTL_MS,
  ONLINE_START_LEAD_MS,
  ONLINE_STATS_PUBLISH_MS,
} from './consts';
import {
  ChartManifest,
  OnlineFinalResult,
  OnlineParticipant,
  OnlinePlaybackStatus,
  OnlineRoomState,
  OnlineSubscriptionChannels,
  PlayersStats,
  SongHoverPreview,
  SongVote,
  SongVotes,
  WireDetailedScore,
} from './types';

/** Fields added after the first release — blobs still in storage predate them, so they stay optional. */
type LatePersistedField = 'chartPreview' | 'bannedIds' | 'created';

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
  /** Push data to all subscribers of a channel. */
  publish: (channel: keyof OnlineSubscriptionChannels, data: unknown) => void;
  /** Persist state so the room survives hibernation/restarts. Fire-and-forget. */
  persist: (state: OnlinePersistedState) => void;
  /** Schedule the TTL cleanup alarm. */
  scheduleTtl: (deadline: number) => void;
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
  private finalResults: OnlineFinalResult[] | null = null;
  private lastActivityAt: number;
  private bannedIds: string[] = [];
  private created = false;
  private finishRequestedAt: number | null = null;
  /** In-memory only — votes on the currently browsed song, not worth persisting. */
  private songVotes: SongVotes = {};
  /** In-memory only — live ping/volume snapshots per participant. */
  private playerStats: PlayersStats = {};

  private timers = new Map<string, unknown>();

  constructor(
    private readonly deps: OnlineRoomDeps,
    restoreFrom?: OnlinePersistedState,
  ) {
    this.lastActivityAt = deps.now();
    if (restoreFrom) {
      this.participants = restoreFrom.participants.map((participant) => ({ ...participant, connected: false }));
      this.nextJoinOrder = restoreFrom.nextJoinOrder;
      this.hostId = restoreFrom.hostId;
      this.tolerance = restoreFrom.tolerance;
      this.phase = restoreFrom.phase;
      this.chart = restoreFrom.chart;
      this.chartData = restoreFrom.chartData;
      this.chartPreview = restoreFrom.chartPreview ?? null;
      this.leaderboard = restoreFrom.leaderboard;
      this.finalResults = restoreFrom.finalResults;
      this.lastActivityAt = restoreFrom.lastActivityAt;
      this.bannedIds = restoreFrom.bannedIds ?? [];
      this.created = restoreFrom.created ?? true;
    }
  }

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
    finalResults: this.finalResults ? [...this.finalResults] : null,
  });

  /**
   * Everything the room needs to come back after a restart, in one place — `OnlinePersistedState`
   * is derived from this method, so a field can never be persisted without being in the type or
   * declared in the type without being written. Public (rather than private) only because a
   * private member cannot be reached by the `ReturnType<…>` that derives the type.
   */
  public snapshot = () => ({
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
    finalResults: this.finalResults,
    lastActivityAt: this.lastActivityAt,
    /** Participants kicked by the host — they cannot rejoin this room. */
    bannedIds: this.bannedIds,
    /** True once someone explicitly opened (created) this room. */
    created: this.created,
  });

  private touch = () => {
    this.lastActivityAt = this.deps.now();
    this.deps.scheduleTtl(this.lastActivityAt + ONLINE_ROOM_TTL_MS);
    this.deps.persist(this.snapshot());
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
      if (name) existing.name = name;
      this.clearTimer(`grace:${id}`);
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
      playback: 'unstarted',
    });
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

    // Keep the spot (and the host role) during the grace window so refreshes don't reshuffle the room
    this.setTimer(`grace:${id}`, ONLINE_RECONNECT_GRACE_MS, () => this.expireGrace(id));
    this.publishState();
  };

  private expireGrace = (id: string) => {
    const participant = this.getParticipant(id);
    if (!participant || participant.connected) return;
    this.removeParticipant(id);
  };

  private removeParticipant = (id: string) => {
    this.clearTimer(`grace:${id}`);
    this.participants = this.participants.filter((other) => other.id !== id);
    this.leaderboard = this.leaderboard.filter((entry) => entry.participantId !== id);
    delete this.songVotes[id];
    delete this.playerStats[id];
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
      participant.playback = 'unstarted';
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

  private resumePlayback = () => {
    if (this.phase !== 'singing' || this.pause === null || this.resumeCountdownEndsAt !== null) return;
    this.resumeCountdownEndsAt = this.deps.now() + ONLINE_RESUME_COUNTDOWN_MS;
    this.setTimer('resume', ONLINE_RESUME_COUNTDOWN_MS, () => {
      this.playbackAnchor = {
        serverTimeMs: this.resumeCountdownEndsAt!,
        videoTimeMs: this.pause?.videoTimeMs ?? 0,
      };
      this.pause = null;
      this.resumeCountdownEndsAt = null;
      this.publishState();
    });
    this.publishState();
  };

  private handlePlaybackStatus = (id: string, status: OnlinePlaybackStatus) => {
    const participant = this.requireParticipant(id);
    participant.playback = status;

    const anyBuffering = this.connectedParticipants().some((other) => other.playback === 'buffering');

    if (this.phase === 'singing' && this.pause === null) {
      if (status === 'buffering') {
        // Only pause everyone when the stall lasts longer than the configured threshold
        if (!this.timers.has('buffering')) {
          this.setTimer('buffering', ONLINE_BUFFERING_PAUSE_MS, () => {
            const stillBuffering = this.connectedParticipants().find((other) => other.playback === 'buffering');
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
    // Plain status updates are NOT broadcast — they arrive constantly during playback and
    // re-publishing the whole room state for each one floods every client.
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

  private enterResults = () => {
    this.phase = 'results';
    // The readiness deadline/timer are left standing — results can be entered straight out of
    // readiness (a forced end) and this transition has never cleared them. The timer is inert
    // outside the readiness phase (beginPlayback bails), but readinessDeadline stays in the
    // published state for the duration of the results.
    this.resetPlayback({ keepReadiness: true });
  };

  /** After the host ends the game, singers that never published a final score get one
   * fabricated from their last leaderboard snapshot so the results can still be shown. */
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
      participant.playback = 'unstarted';
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

  // --- RPC handlers ---

  public createHandlers = () => ({
    room: {
      getState: defineQuery(() => this.getState()),
      getServerTime: defineQuery(() => this.deps.now()),
      setName: defineMutation((ctx, name: string) => {
        const participant = this.requireParticipant(ctx.senderId);
        participant.name = name.trim() || participant.name;
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
      returnToLobby: defineMutation(() => {
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
      /** Report your connection latency and mic volume so others can see them. */
      reportStats: defineMutation((ctx, ping: number, volume: number) => {
        this.requireParticipant(ctx.senderId);
        this.playerStats[ctx.senderId] = { ping: Math.round(ping), volume };
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
          // Validates decompression, length and hash against the manifest
          await unpackChartTransfer(manifest, data);
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
