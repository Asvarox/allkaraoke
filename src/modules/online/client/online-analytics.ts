import { throttle } from 'es-toolkit';
import posthog from 'posthog-js';

import { GAME_MODE, Song } from '~/interfaces';
import { OnlineRoomMode } from '~/modules/online/client/room-mode';
import { OnlineRoomState } from '~/modules/online/protocol/types';
import { OnlineDataPlane } from '~/modules/online/signaling/protocol';

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

/** How much of the ping loop reaches analytics. The tracker measures every couple of seconds,
 * which is what the live readout needs and far more than a transport comparison does — one sample
 * a minute per client keeps a long room from drowning out a short one. */
const PING_REPORT_INTERVAL_MS = 60_000;

interface OnlinePingReport {
  ping: number;
  roomCode: string;
  roomMode: OnlineRoomMode;
  /** True while this browser is the p2p host, whose transport is a loopback into its own tab: the
   * measurement is then ~0 and is not a network reading at all. Server-mode rooms have no loopback
   * — every client, room controller included, is on a real socket to the PartyKit room — so this is
   * only ever true for `p2p`. Reported rather than dropped, so a per-player latency view can keep
   * it while a transport comparison filters it out. */
  isLoopbackHost: boolean;
  /** Null in server mode, where the room's Durable Object is the data plane and there is no
   * connection to ask. */
  dataPlane: OnlineDataPlane | null;
}

/** Round-trip latency to whoever runs the room, for comparing the PartyKit and P2P transports.
 * `roomMode` has to be sent explicitly — `roomCodeHash` destroys the lead character `roomModeOf`
 * reads the mode from. */
export const trackOnlinePing = throttle(({ ping, roomCode, roomMode, isLoopbackHost, dataPlane }: OnlinePingReport) => {
  posthog.capture('onlinePing', {
    ping,
    roomMode,
    isLoopbackHost,
    dataPlane,
    roomCodeHash: hashRoomCode(roomCode),
  });
}, PING_REPORT_INTERVAL_MS);
