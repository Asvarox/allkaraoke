import { useMemo, useSyncExternalStore } from 'react';

import GameState from '~/modules/game-engine/game-state/game-state';
import { useOnlineLeaderboard } from '~/modules/online/client/hooks';
import OnlineClient from '~/modules/online/client/online-client';
import { LeaderboardEntry } from '~/modules/online/protocol/types';
import { PlayerNumber } from '~/modules/players/player-number';

/**
 * The room's leaderboard, with this singer's own row taken from their own game.
 *
 * Every score on the leaderboard reaches it over the network: a singer publishes once a second,
 * the room coalesces the pushes, and the result travels back to everyone. For other singers that
 * is the only source there is. For your own row it is a detour — your browser is the one computing
 * that score — and the round trip leaves the box a second or two behind the score next to your
 * notes, visibly lagging the singing that produced it. So your row is read locally instead, and the
 * ranking is recomputed from it, so overtaking somebody shows the moment it happens.
 */

/** How often the local score is re-read. The game engine updates it every frame; this only has to
 * look continuous, and anything finer re-renders the leaderboard for no visible gain. */
export const LIVE_SCORE_REFRESH_MS = 100;

/** This browser's score as its own game has it right now, or null when there is nothing to read.
 * Floored because that is how every online screen shows a score (`formatScore`), which also keeps a
 * fraction of a point from re-rendering anything. */
export const readOwnScore = (playerNumber: PlayerNumber | undefined): number | null => {
  // Not singing: whatever the game engine still holds belongs to a previous game.
  if (playerNumber === undefined || !GameState.isPlaying()) return null;
  const score = GameState.getPlayerScore(playerNumber);
  // -1 is the engine's "no such player" — the song has not started for this browser yet.
  return score < 0 ? null : Math.floor(score);
};

/** The leaderboard with one participant's score replaced and the ranking redone. Returns the same
 * array when there is nothing to change, so callers can depend on its identity. */
export const withOwnScore = (
  leaderboard: LeaderboardEntry[],
  selfId: string,
  ownScore: number | null,
): LeaderboardEntry[] => {
  if (ownScore === null) return leaderboard;
  const own = leaderboard.find((entry) => entry.participantId === selfId);
  if (!own || own.score === ownScore) return leaderboard;
  return (
    leaderboard
      .map((entry) => (entry === own ? { ...entry, score: ownScore } : entry))
      // Stable, so singers level on points keep the order the room gave them.
      .sort((a, b) => b.score - a.score)
  );
};

/** Who leads, for the first-place medal — null on an empty board or a tie at the top, the same way
 * the local game hands out no medal on a tie. */
export const leaderOf = (leaderboard: LeaderboardEntry[]): PlayerNumber | null => {
  if (!leaderboard.length) return null;
  const top = leaderboard.reduce((best, entry) => (entry.score > best.score ? entry : best));
  const tied = leaderboard.some((entry) => entry.participantId !== top.participantId && entry.score === top.score);
  return tied ? null : top.playerNumber;
};

/**
 * One interval shared by every live reader, running only while somebody is subscribed.
 *
 * The game engine is a mutable singleton with no change events, so it is polled — and it is polled
 * through `useSyncExternalStore`, which is what makes a render-time read of it safe. A plain read in
 * the component body is exactly what the React Compiler caches, which is why the in-game overlay
 * needs `'use no memo'` to keep its score moving.
 */
const liveScoreListeners = new Set<() => void>();
let liveScoreInterval: ReturnType<typeof setInterval> | null = null;

const subscribeToLiveScore = (listener: () => void) => {
  liveScoreListeners.add(listener);
  liveScoreInterval ??= setInterval(() => liveScoreListeners.forEach((notify) => notify()), LIVE_SCORE_REFRESH_MS);
  return () => {
    liveScoreListeners.delete(listener);
    if (liveScoreListeners.size === 0 && liveScoreInterval !== null) {
      clearInterval(liveScoreInterval);
      liveScoreInterval = null;
    }
  };
};

const useOwnEntry = (leaderboard: LeaderboardEntry[]) => {
  const selfId = OnlineClient.getParticipantId();
  return { selfId, own: leaderboard.find((entry) => entry.participantId === selfId) };
};

/** The leaderboard as this singer should see it: everyone else as the room last reported them, and
 * this singer as they are right now. Re-renders whenever their own score moves. */
export const useLiveOnlineLeaderboard = (): LeaderboardEntry[] => {
  const leaderboard = useOnlineLeaderboard();
  const { selfId, own } = useOwnEntry(leaderboard);
  // The room assigns the player number the local game sings under, so the entry says where to read.
  const ownScore = useSyncExternalStore(subscribeToLiveScore, () => readOwnScore(own?.playerNumber));
  return useMemo(() => withOwnScore(leaderboard, selfId, ownScore), [leaderboard, selfId, ownScore]);
};

/** Who leads the live leaderboard. Re-renders only when the leader changes — the singing screen
 * that needs this is far heavier than the leaderboard, and a score that climbs every frame must not
 * drag it along. */
export const useLiveOnlineLeader = (): PlayerNumber | null => {
  const leaderboard = useOnlineLeaderboard();
  const { selfId, own } = useOwnEntry(leaderboard);
  return useSyncExternalStore(subscribeToLiveScore, () =>
    leaderOf(withOwnScore(leaderboard, selfId, readOwnScore(own?.playerNumber))),
  );
};
