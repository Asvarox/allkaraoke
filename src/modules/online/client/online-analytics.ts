import posthog from 'posthog-js';

import { GAME_MODE, Song } from '~/interfaces';
import { PingStats } from '~/modules/network/rpc/ping-stats';
import { OnlineRoomState } from '~/modules/online/protocol/types';

/** Non-reversible digest of the room code for event correlation — avoids sending the raw,
 * joinable room code to the analytics vendor while still letting events for the same room be
 * grouped together. */
const hashRoomCode = (roomCode: string): string => {
  let hash = 0;
  for (let i = 0; i < roomCode.length; i++) {
    hash = (hash * 31 + roomCode.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
};

/** Shared fields for the online songStarted/songEnded captures — mirrors the local-mode shape
 * (`players`, `score0`, `score1`, ...) so the two play modes stay comparable in PostHog, split by
 * the `playMode` property. */
const songMeta = (roomState: OnlineRoomState, song: Song) => ({
  songId: song.id,
  songLastUpdated: song.lastUpdate,
  name: `${song.artist} - ${song.title}`,
  artist: song.artist,
  title: song.title,
  mode: GAME_MODE.DUEL,
  tolerance: roomState.tolerance,
  players: roomState.participants.length,
  roomCodeHash: hashRoomCode(roomState.roomCode),
  playMode: 'online' as const,
});

/** Host-only, fired once the room actually starts singing (not at song selection). */
export const trackOnlineSongStarted = (roomState: OnlineRoomState, song: Song) => {
  posthog.capture('songStarted', songMeta(roomState, song));
};

/** Host-only, fired once the room reaches the results screen. Scores come from the room's
 * leaderboard, same `{ name, score }` shape local mode reports. */
export const trackOnlineSongEnded = (roomState: OnlineRoomState, song: Song) => {
  const scores = roomState.leaderboard.map((entry) => entry.score);
  const sameScores = scores.length > 1 && scores.every((score) => score === scores[0]);

  posthog.capture('songEnded', {
    ...songMeta(roomState, song),
    sameScores,
    ...scores.reduce((curr, score, index) => ({ ...curr, [`score${index}`]: score }), {}),
  });
};

export const trackOnlineDriftSeek = (songId: string, driftMs: number) => {
  posthog.capture('onlineDriftSeek', { songId, driftMs: Math.round(driftMs) });
};

export const trackOnlinePlayerKicked = () => {
  posthog.capture('onlinePlayerKicked');
};

interface OnlineSongPingReport {
  stats: PingStats;
  songId: string;
  roomCode: string;
  /** True while this browser is the host, whose transport is a loopback into its own tab: the
   * measurements are then ~0 and are not network readings at all. Reported rather than dropped, so a
   * per-player latency view can keep them while a transport comparison filters them out. */
  isLoopbackHost: boolean;
  /** The host role moved to or from this tab during the song, so the sample mixes both kinds. */
  hostChanged: boolean;
}

/** Round-trip latency to whoever runs the room, summarised over one song — one event per singer per
 * song, the same shape remote mics report as `remote_mic_song_ping`. */
export const trackOnlineSongPing = ({ stats, songId, roomCode, isLoopbackHost, hostChanged }: OnlineSongPingReport) => {
  posthog.capture('onlineSongPing', {
    ...stats,
    songId,
    isLoopbackHost,
    hostChanged,
    roomCodeHash: hashRoomCode(roomCode),
  });
};

/**
 * Fired once per message this browser successfully sends, never for messages received.
 *
 * Deliberately carries no message text and no participant id — what is worth knowing is whether
 * anyone chats at all and in what kind of room, and the content of a private party's conversation
 * is not ours to ship anywhere. `length` is the one thing kept from the message itself, as a
 * rough read on whether the 200-character cap is anywhere near being a constraint.
 */
export const trackOnlineChatMessageSent = (roomCode: string, length: number) => {
  posthog.capture('onlineChatMessageSent', {
    roomCodeHash: hashRoomCode(roomCode),
    length,
  });
};
