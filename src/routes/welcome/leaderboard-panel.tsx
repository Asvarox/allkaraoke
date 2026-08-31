import useSWR from 'swr';

import { Skeleton } from '~/modules/elements/akui/skeleton';
import { fetchBoard, LEADERBOARD_URL } from '~/modules/leaderboard/client';
import LeaderboardRow from '~/modules/leaderboard/leaderboard-row';
import useLeaderboardEnabled from '~/modules/leaderboard/use-leaderboard-enabled';
import ScoreboardPanel from '~/modules/scoreboard/scoreboard-panel';

/** 10 rows fit; the rest of the top 50 is reachable by mouse or touch scroll only. */
const VISIBLE_ROWS = 10;

/**
 * The global board, read straight from the cached `GET /leaderboard` projection. Deliberately
 * skipped by `useKeyboardNav`: making 50 rows keyboard-traversable would add a navigation sink that
 * TV users hit by accident, so on a TV this is a display of the top 10 and nothing more.
 */
function LeaderboardPanel({ className }: { className?: string }) {
  const leaderboardEnabled = useLeaderboardEnabled();

  const { data, error, isLoading } = useSWR(leaderboardEnabled ? LEADERBOARD_URL : null, fetchBoard, {
    revalidateOnFocus: false,
  });

  if (!leaderboardEnabled) return null;

  return (
    // Same box the main menu sits in, so the panel reads as part of it rather than a bolted-on
    // widget — and the same `ScoreboardPanel` the post-game boards use, so a board looks like a board
    <ScoreboardPanel
      // Capped rather than left to grow down the page: 50 rows would run past the menu beside it
      className={`max-h-[32rem] gap-4 p-4 sm:p-7 ${className ?? ''}`}
      title="Global leaderboard"
      subtitle="Highest scores from the last 14 days"
      data-test="leaderboard-panel">
      {isLoading &&
        Array.from({ length: VISIBLE_ROWS }, (_, index) => <Skeleton key={index} className="h-12 w-full rounded-xl" />)}
      {!isLoading && error && (
        <p className="typography text-sm opacity-70" data-test="leaderboard-error">
          Failed to load results
        </p>
      )}
      {!isLoading && !error && data?.entries.length === 0 && (
        <p className="typography text-sm opacity-70" data-test="leaderboard-empty">
          No results yet
        </p>
      )}
      {!error &&
        data?.entries.map((entry, index) => (
          <LeaderboardRow key={`${entry.songId}-${entry.name}-${index}`} entry={entry} position={index + 1} />
        ))}
    </ScoreboardPanel>
  );
}

export default LeaderboardPanel;
