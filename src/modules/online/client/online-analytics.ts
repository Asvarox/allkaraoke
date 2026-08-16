import posthog from 'posthog-js';

import { GAME_MODE, Song } from '~/interfaces';
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

export const trackOnlineRoomConnectAttempt = (
  action: 'create' | 'join',
  result: 'success' | 'failed',
  reason?: string,
) => {
  posthog.capture('onlineRoomConnect', { action, result, reason });
};

export const trackOnlineSongSelected = (songId: string, artist: string, title: string) => {
  posthog.capture('onlineSongSelected', { songId, artist, title });
};

export const trackOnlineDriftSeek = (songId: string, driftMs: number) => {
  posthog.capture('onlineDriftSeek', { songId, driftMs: Math.round(driftMs) });
};

export const trackOnlinePlayerKicked = () => {
  posthog.capture('onlinePlayerKicked');
};
