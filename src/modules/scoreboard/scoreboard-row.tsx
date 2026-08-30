import clsx from 'clsx';
import { ReactNode, useEffect, useRef } from 'react';

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
  /** Brings the row into the middle of the list it sits in. For the one row the player came to see. */
  scrollIntoView?: boolean;
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
function ScoreboardRow({
  position,
  name,
  score,
  subtitle,
  meta,
  highlighted,
  scrollIntoView,
  'data-test': dataTest,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Not `Element.scrollIntoView`: that walks every scrollable ancestor, and the whole page is one of
  // them here. The list this row sits in is its own parent, so scrolling that directly is enough.
  //
  // Re-run whenever the list resizes: the panel takes its height from what the rest of the step
  // leaves over, so on the first paint the list is often shorter than it ends up, and centring
  // against that height lands the row near the top.
  useEffect(() => {
    const row = ref.current;
    const list = row?.parentElement;
    if (!scrollIntoView || !row || !list) return;

    const centre = () => {
      list.scrollTop = row.offsetTop - list.offsetTop - (list.clientHeight - row.clientHeight) / 2;
    };

    centre();

    const observer = new ResizeObserver(centre);
    observer.observe(list);

    return () => observer.disconnect();
  }, [scrollIntoView]);

  return (
    <div
      ref={ref}
      className={clsx(
        'typography flex items-center gap-2 rounded-xl px-2 py-2 text-sm',
        // The same ring the focused controls elsewhere on the screen carry, so the player's own row
        // is found the way everything else on a TV is found
        highlighted ? 'subtle-focus bg-black/90' : 'bg-black/55',
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
