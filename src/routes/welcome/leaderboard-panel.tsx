import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useSWR from 'swr';

import { Skeleton } from '~/modules/elements/akui/skeleton';
import { Flag } from '~/modules/elements/flag';
import { fetchBoard, LEADERBOARD_URL } from '~/modules/leaderboard/client';
import { BoardEntry } from '~/modules/leaderboard/types';
import useLeaderboardEnabled from '~/modules/leaderboard/use-leaderboard-enabled';
import ScoreText from '~/routes/game/singing/game-overlay/components/score-text';

// Registered here rather than app-wide — this is the only screen that renders a relative date
dayjs.extend(relativeTime);

const difficultyNames = ['Hard', 'Medium', 'Easy'];

/** `tolerance` on a sing setup is 1-based; anything outside the shipped range renders as nothing. */
const difficultyName = (tolerance: number) => difficultyNames[tolerance - 1];

/** 10 rows fit; the rest of the top 50 is reachable by mouse or touch scroll only. */
const VISIBLE_ROWS = 10;

function Row({ entry, position }: { entry: BoardEntry; position: number }) {
  return (
    <div className="typography flex items-center gap-2 bg-black/50 px-3 py-2 text-sm" data-test="leaderboard-row">
      <div className="text-active w-6 shrink-0 text-right">{position}</div>
      <div className="ph-no-capture w-5 shrink-0">
        <Flag isocode={entry.country ?? 'un'} loading="lazy" className="h-[1em] w-[1.5em] object-cover" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="ph-no-capture truncate">{entry.name}</div>
        <div className="truncate text-xs opacity-70">
          {entry.artist} — {entry.title}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <ScoreText score={entry.score} />
        <div className="text-xs opacity-70">
          {[difficultyName(entry.tolerance), dayjs(entry.createdAt).fromNow()].filter(Boolean).join(' · ')}
        </div>
      </div>
    </div>
  );
}

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
    <div className={className} data-test="leaderboard-panel">
      <h2 className="typography text-active mb-2 text-lg">Global leaderboard</h2>
      <div className="flex max-h-[26rem] flex-col gap-1 overflow-y-auto">
        {isLoading &&
          Array.from({ length: VISIBLE_ROWS }, (_, index) => <Skeleton key={index} className="h-12 w-full" />)}
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
            <Row key={`${entry.songId}-${entry.name}-${index}`} entry={entry} position={index + 1} />
          ))}
      </div>
    </div>
  );
}

export default LeaderboardPanel;
