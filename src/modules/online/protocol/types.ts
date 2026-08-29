import { RpcMessages } from '~/modules/network/rpc/types';
import { PlayerNumber } from '~/modules/players/player-number';

/** `readiness` is the host having started the song: every singer sits on the singing screen with the
 * video loaded but held, confirming they're ready — the same beat the local game has when playing
 * with remote mics. */
export type OnlinePhase = 'lobby' | 'readiness' | 'singing' | 'results';

export type OnlinePlaybackStatus = 'unstarted' | 'playing' | 'paused' | 'buffering';

export interface OnlineParticipant {
  id: string;
  name: string;
  /** Monotonic join counter — host is the earliest-joined connected participant. */
  joinOrder: number;
  playerNumber: PlayerNumber;
  connected: boolean;
  /** Confirmed "I'm ready to sing" during the readiness phase. Meaningless in any other phase. */
  ready: boolean;
  /** Absolute deadline for the reconnect grace window while disconnected, else null. Persisted so
   * a restore re-arms the remaining time rather than granting a fresh window every wake. */
  graceDeadline: number | null;
}

/** Manifest describing a chart (song txt) transferred as a single gzip+base64 payload. */
export interface ChartManifest {
  songId: string;
  artist: string;
  title: string;
  /** YouTube video id — clients load the media themselves. */
  video: string;
  /** FNV-1a hash of the whole (uncompressed) chart txt. */
  hash: string;
  /** Length of the chart txt in UTF-16 code units. */
  length: number;
}

export interface LeaderboardEntry {
  participantId: string;
  name: string;
  playerNumber: PlayerNumber;
  score: number;
}

/** Detailed score kept opaque on the wire ([score, maxScore] per note type) so the protocol
 * stays decoupled from the game engine types. */
export type WireDetailedScore = [Record<string, number>, Record<string, number>];

export interface OnlineFinalResult {
  participantId: string;
  name: string;
  playerNumber: PlayerNumber;
  detailedScore: WireDetailedScore;
  /** True when this result was fabricated by the room (from the last leaderboard snapshot)
   * because the singer never published a final score before the host ended the game — the
   * ratio in `detailedScore` is not a real performance and should not be rendered as one. */
  incomplete?: boolean;
}

export interface OnlinePauseState {
  participantId: string;
  name: string;
  reason: 'manual' | 'buffering';
  /** Expected video position (ms, gap-inclusive) at the moment of pausing. */
  videoTimeMs: number;
}

/** Anchor tying a video position to a server timestamp — clients derive the expected
 * current position as videoTimeMs + (serverNow - serverTimeMs). */
export interface PlaybackAnchor {
  serverTimeMs: number;
  videoTimeMs: number;
}

export interface OnlineRoomState {
  roomCode: string;
  phase: OnlinePhase;
  participants: OnlineParticipant[];
  hostId: string | null;
  /** Pitch-matching tolerance for scoring, an integer from ONLINE_MIN_TOLERANCE to
   * ONLINE_MAX_TOLERANCE (see consts.ts) — same scale as the local game's difficulty picker,
   * higher is more forgiving. Set by the host via selection.setChart. */
  tolerance: number;
  chart: ChartManifest | null;
  /** Server timestamp when the song starts whether or not everyone has confirmed. Set for the
   * whole readiness phase, null otherwise. */
  readinessDeadline: number | null;
  /** Set while singing (and cleared when paused). */
  playbackAnchor: PlaybackAnchor | null;
  pause: OnlinePauseState | null;
  /** Server timestamp when a pending resume kicks in. */
  resumeCountdownEndsAt: number | null;
  /** Set when the host ended the game — clients wrap up and publish their final scores. */
  finishRequestedAt: number | null;
  leaderboard: LeaderboardEntry[];
  finalResults: OnlineFinalResult[] | null;
  /** Bumped by the room directory on every host change. Clients carry it into their promotion
   * claim, which the directory accepts only if it still matches — that is what stops two singers
   * who noticed the same stall from both becoming host. */
  hostEpoch: number;
}

/** What the host is currently focusing in the song browser — shown live to the other singers,
 * with enough metadata for them to preview the video and details themselves. */
export interface SongHoverPreview {
  songId: string;
  artist: string;
  title: string;
  /** Difficulty name chosen by the host in the song settings, when known. */
  difficulty?: string;
  /** Game mode — online v1 only supports Duel. */
  mode?: string;
  /** YouTube video id so other singers can watch/listen to the preview. */
  video?: string;
  language?: string[];
  /** Country the artist is from — the song list picks the flag from it when it matches the language. */
  artistOrigin?: string;
  year?: string;
  previewStart?: number;
  previewEnd?: number;
  volume?: number;
}

export type SongVote = 'up' | 'down';

/** Per-participant vote on the song the host is browsing. */
export type SongVotes = Record<string, { songId: string; vote: SongVote }>;

/** Live connection/mic stats each singer reports about themselves. */
export interface PlayerStats {
  /** Round-trip latency to the room server, ms. */
  ping: number;
  /** Current microphone volume, 0..~0.05 scale (same as InputManager.getPlayerVolume). */
  volume: number;
  /** They stopped reporting — away from the keyboard, or the tab is hidden. Both `volume` and
   * `ping` are frozen at their last real values while this is set, so render the row as away
   * rather than as a silent singer with a good connection. */
  idle?: boolean;
}

export type PlayersStats = Record<string, PlayerStats>;

export type OnlineSubscriptionChannels = {
  'room-state': OnlineRoomState;
  leaderboard: LeaderboardEntry[];
  'song-preview': SongHoverPreview | null;
  'song-votes': SongVotes;
  'player-stats': PlayersStats;
};

interface OnlinePingMessage {
  t: 'ping';
}
interface OnlinePongMessage {
  t: 'pong';
}

/**
 * First thing a client sends on its slot channel. The SFU tells the host which slot a frame came
 * in on but nothing about who owns it, so this is where a slot gets bound to a participant — it
 * carries exactly what the old server read off the connection URL.
 */
export interface OnlineHelloMessage {
  t: 'hello';
  participantId: string;
  name: string;
  create: boolean;
}

/**
 * The host's running state, broadcast so that whoever succeeds it can pick the room up mid-song
 * instead of dumping everyone back into a lobby.
 *
 * `state` is deliberately opaque here. Its real shape is `OnlinePersistedState`, which is *derived
 * from* the room logic's own `snapshot()` so a field cannot be persisted without being in the type;
 * naming it in this file would invert that (room-logic imports this one) and let the two drift.
 * The compressed chart is not in it — it is the only large field and every client already caches
 * its own copy from `selection.getChart`, so a successor re-injects that rather than being sent it
 * a few times a minute for the whole song.
 */
export interface OnlineSnapshotMessage {
  t: 'snapshot';
  state: unknown;
}

/** Broadcast by the host at ONLINE_HOST_HEARTBEAT_MS. Its absence is what triggers succession, and
 * the epoch it carries lets a client that reconnected to a newer host notice it is behind. */
export interface OnlineHeartbeatMessage {
  t: 'hb';
  epoch: number;
}

export type OnlineMessages =
  | RpcMessages<OnlineSubscriptionChannels>
  | OnlinePingMessage
  | OnlinePongMessage
  | OnlineHelloMessage
  | OnlineHeartbeatMessage
  | OnlineSnapshotMessage;
