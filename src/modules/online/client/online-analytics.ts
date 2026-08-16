import posthog from 'posthog-js';

import { GAME_MODE, Song } from '~/interfaces';
import { OnlineRoomState } from '~/modules/online/protocol/types';

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
  roomCode: roomState.roomCode,
  playMode: 'online' as const,
});

/** Host-only, fired once the room actually starts singing (not at song selection). */
export const trackOnlineSongStarted = (roomState: OnlineRoomState, song: Song) => {
  posthog.capture('songStarted', songMeta(roomState, song));
};

/** Host-only, fired once the room reaches the results screen. Scores come from the room's
 * leaderboard, same `{ name, score }` shape local mode reports. */
export const trackOnlineSongEnded = (roomState: OnlineRoomState, song: Song) => {
  const scores = roomState.leaderboard.map((entry) => ({ name: entry.name, score: entry.score }));
  const sameScores = scores.length > 1 && scores.every((score) => score.score === scores[0].score);

  posthog.capture('songEnded', {
    ...songMeta(roomState, song),
    sameScores,
    ...scores.reduce((curr, score, index) => ({ ...curr, [`score${index}`]: score.score }), {}),
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
