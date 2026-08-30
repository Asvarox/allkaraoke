import clsx from 'clsx';
import { ReactNode } from 'react';

import ScoreText from '~/routes/game/singing/game-overlay/components/score-text';

interface Props {
  position: number;
  /** A node rather than a string: the local board puts an editable name field here. */
  name: ReactNode;
  score: number;
  /** Small line under the name — the song on a board that mixes songs, nothing on one that does not. */
  subtitle?: ReactNode;
  /** Small line under the score — a date, a difficulty, or both. */
  meta?: ReactNode;
  /** The row for the run that has just been sung, on a board that contains it. */
  highlighted?: boolean;
  'data-test'?: string;
}

/**
 * One row of a scoreboard, shared by all three: the local high scores and the song's global board on
 * the post-game screen, and the global board on the main menu. The two post-game boards sit side by
 * side, so anything that made them look like different components would read as a mistake.
 *
 * Same rounded-box look as a `Menu.Button`, minus every interactive cue (no hover glow, no focus
 * border/inner-shadow) — the row itself is not a control, even when something inside it is.
 */
function ScoreboardRow({ position, name, score, subtitle, meta, highlighted, 'data-test': dataTest }: Props) {
  return (
    <div
      className={clsx(
        'typography flex items-center gap-2 rounded-xl px-2 py-2 text-sm',
        highlighted ? 'bg-black/90' : 'bg-black/55',
      )}
      data-test={dataTest}>
      <div className="text-active text-md w-[2ch] shrink-0 text-right tabular-nums">{position}</div>
      <div className="min-w-0 flex-1 text-left">
        <div className="ph-no-capture flex items-center gap-2 truncate">{name}</div>
        {subtitle && <div className="truncate text-xs opacity-70">{subtitle}</div>}
      </div>
      <div className="shrink-0 text-right">
        <span className="text-active font-semibold">
          <ScoreText score={score} />
        </span>
        {meta && <div className="text-xs opacity-70">{meta}</div>}
      </div>
    </div>
  );
}

export default ScoreboardRow;
