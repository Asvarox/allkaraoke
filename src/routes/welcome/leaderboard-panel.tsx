import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useSWR from 'swr';

import { Menu } from '~/modules/elements/akui/menu';
import Box from '~/modules/elements/akui/primitives/box';
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
    // Same rounded-box look as a `Menu.Button`, minus every interactive cue (no hover glow, no
    // focus border/inner-shadow) - these rows are read-only
    <div
      className="typography flex items-center gap-2 rounded-xl bg-black/55 px-2 py-3 text-sm"
      data-test="leaderboard-row">
      <div className="text-active text-md w-[2ch] shrink-0 text-right tabular-nums">{position}</div>
      <div className="min-w-0 flex-1 text-left">
        <div className="ph-no-capture flex items-center gap-2 truncate">
          <Flag isocode={entry.country ?? 'un'} loading="lazy" className="h-[1em] w-[1.5em] object-cover" />
          {entry.name}
        </div>
        <div className="truncate text-xs opacity-70">
          {entry.artist} — {entry.title}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span className="text-active font-semibold">
          <ScoreText score={entry.score} />
        </span>
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
    // Same box the main menu sits in, so the panel reads as part of it rather than a bolted-on widget
    <Box className={`w-full items-stretch gap-4 p-4 sm:p-7 ${className ?? ''}`} data-test="leaderboard-panel">
      <Menu.Header as="h2">Global leaderboard</Menu.Header>
      <Menu.HelpText className="-mt-4">Highest scores from the last 14 days</Menu.HelpText>
      <div className="flex max-h-[26rem] flex-col gap-1 overflow-y-auto">
        {isLoading &&
          Array.from({ length: VISIBLE_ROWS }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
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
    </Box>
  );
}

export default LeaderboardPanel;
