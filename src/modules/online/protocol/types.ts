import { PlayerNumber } from '~/modules/players/player-number';
import { RpcMessages } from '~/modules/remote-mic/network/rpc/types';

export type OnlinePhase = 'lobby' | 'countdown' | 'singing' | 'results';

export type ProbeStatus = 'unknown' | 'pending' | 'playable' | 'failed';

export type OnlinePlaybackStatus = 'unstarted' | 'playing' | 'paused' | 'buffering';

export interface OnlineParticipant {
  id: string;
  name: string;
  /** Monotonic join counter — host is the earliest-joined connected participant. */
  joinOrder: number;
  playerNumber: PlayerNumber;
  connected: boolean;
  ready: boolean;
  probe: ProbeStatus;
  playback: OnlinePlaybackStatus;
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
  tolerance: number;
  chart: ChartManifest | null;
  /** Set while all singers are expected to probe video playability. */
  probeDeadline: number | null;
  /** Server timestamp when the synchronized start countdown ends and playback begins. */
  countdownEndsAt: number | null;
  /** Set while singing (and cleared when paused). */
  playbackAnchor: PlaybackAnchor | null;
  pause: OnlinePauseState | null;
  /** Server timestamp when a pending resume kicks in. */
  resumeCountdownEndsAt: number | null;
  /** Set when the host ended the game — clients wrap up and publish their final scores. */
  finishRequestedAt: number | null;
  leaderboard: LeaderboardEntry[];
  finalResults: OnlineFinalResult[] | null;
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

export type OnlineMessages = RpcMessages<OnlineSubscriptionChannels> | OnlinePingMessage | OnlinePongMessage;
