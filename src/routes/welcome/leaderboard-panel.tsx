import useSWR from 'swr';

import { fetchBoard, LEADERBOARD_URL } from '~/modules/leaderboard/client';
import LeaderboardRow from '~/modules/leaderboard/leaderboard-row';
import useLeaderboardEnabled from '~/modules/leaderboard/use-leaderboard-enabled';
import ScoreboardPanel from '~/modules/scoreboard/scoreboard-panel';

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
      className={`p-4 sm:p-7 ${className ?? ''}`}
      // In the main menu's full-height rail the list takes whatever room is left rather than stopping
      // at the shared five-row height; everywhere narrower it keeps that height and scrolls.
      listClassName="lg:h-auto lg:min-h-0 lg:flex-1"
      title="Global leaderboard"
      subtitle="Highest scores from the last 14 days"
      isLoading={isLoading}
      error={error}
      isEmpty={data?.entries.length === 0}
      emptyMessage="No results yet"
      data-test="leaderboard-panel">
      {data?.entries.map((entry, index) => (
        <LeaderboardRow key={`${entry.songId}-${entry.name}-${index}`} entry={entry} position={index + 1} />
      ))}
    </ScoreboardPanel>
  );
}

export default LeaderboardPanel;
