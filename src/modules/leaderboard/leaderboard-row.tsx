import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Flag } from '~/modules/elements/flag';
import { difficultyName } from '~/modules/leaderboard/difficulty';
import { BoardEntry } from '~/modules/leaderboard/types';
import ScoreText from '~/routes/game/singing/game-overlay/components/score-text';

// The leaderboards are the only screens that render a relative date
dayjs.extend(relativeTime);

interface Props {
  entry: BoardEntry;
  position: number;
  /** Off for a board that is already one song and one difficulty — both would be the same on every row. */
  withSongDetails?: boolean;
  'data-test'?: string;
}

/**
 * One row of a leaderboard, shared by the global board on the main menu and the per-song board on
 * the post-game screen. Same rounded-box look as a `Menu.Button`, minus every interactive cue (no
 * hover glow, no focus border/inner-shadow) — these rows are read-only.
 */
function LeaderboardRow({ entry, position, withSongDetails = true, 'data-test': dataTest = 'leaderboard-row' }: Props) {
  return (
    <div className="typography flex items-center gap-2 rounded-xl bg-black/55 px-2 py-3 text-sm" data-test={dataTest}>
      <div className="text-active text-md w-[2ch] shrink-0 text-right tabular-nums">{position}</div>
      <div className="min-w-0 flex-1 text-left">
        <div className="ph-no-capture flex items-center gap-2 truncate">
          <Flag isocode={entry.country ?? 'un'} loading="lazy" className="h-[1em] w-[1.5em] object-cover" />
          {entry.name}
        </div>
        {withSongDetails && (
          <div className="truncate text-xs opacity-70">
            {entry.artist} — {entry.title}
          </div>
        )}
      </div>
      <div className="shrink-0 text-right">
        <span className="text-active font-semibold">
          <ScoreText score={entry.score} />
        </span>
        <div className="text-xs opacity-70">
          {[withSongDetails ? difficultyName(entry.tolerance) : null, dayjs(entry.createdAt).fromNow()]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>
    </div>
  );
}

export default LeaderboardRow;
