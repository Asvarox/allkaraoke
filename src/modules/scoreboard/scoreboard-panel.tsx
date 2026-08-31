import clsx from 'clsx';
import { ReactNode, useEffect, useRef, useState } from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import Box from '~/modules/elements/akui/primitives/box';

/**
 * The pair on the post-game step.
 *
 * Two layouts, because the step has two very different amounts of room. Side by side it is an even
 * split of what the step has left over (`flex-1 basis-0`, `h-full`) and the screen never scrolls.
 * Stacked there is not enough height to divide — a phone in landscape left both boards a hundred
 * pixels each, with their headings colliding with the panel below — so each takes a fixed few rows
 * and the page scrolls instead.
 */
export const POST_GAME_SCOREBOARD_CLASS =
  'max-h-[18rem] border border-white/10 p-2 lg:h-full lg:max-h-full lg:flex-1 lg:basis-0';

interface Props {
  title: string;
  /** What the board covers — the heading has no room to say it. */
  subtitle: ReactNode;
  children: ReactNode;
  /**
   * Rendered repeatedly to fill the list out to its full height, once for each row of empty space
   * left under `children`. For a board with fewer rows than it has room for, so it reads as a board
   * with space still to earn rather than as a panel that failed to load.
   */
  fill?: (index: number) => ReactNode;
  className?: string;
  'data-test'?: string;
}

/**
 * The surface every board sits on: a titled panel with a scrolling list of {@link ScoreboardRow}s.
 * All three use it — the local high scores and the song's global board on the post-game screen, and
 * the global board on the main menu — so a board looks like a board wherever it turns up.
 *
 * `Box` centres its children; this stacks them full width instead, and spells out its own surface —
 * `Box`'s `bg-black/30` is invisible against these screens, and the border is what reads as an edge.
 *
 * Sizing and padding are the caller's, through `className`: the post-game pair splits a row and
 * shares its height, the main-menu board sits in a fixed column with room to breathe. Tailwind
 * classes of the same property do not merge through `clsx`, so nothing overridable belongs in the
 * base.
 */
function ScoreboardPanel({ title, subtitle, children, fill, className, 'data-test': dataTest }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const [rowsThatFit, setRowsThatFit] = useState(0);

  /**
   * How many rows the list has room for, measured rather than assumed — the height is whatever the
   * parent left over, and the row height comes from the rows themselves.
   *
   * Placeholders are excluded from the count, so adding them cannot feed back into the measurement.
   */
  useEffect(() => {
    const list = listRef.current;
    if (!fill || !list) return;

    const measure = () => {
      const rows = list.querySelectorAll<HTMLElement>(':scope > :not([data-placeholder])');
      const rowHeight = rows[0]?.offsetHeight;
      if (!rowHeight) return;

      const gap = parseFloat(getComputedStyle(list).rowGap) || 0;

      setRowsThatFit(Math.floor((list.clientHeight + gap) / (rowHeight + gap)) - rows.length);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(list);

    return () => observer.disconnect();
  }, [fill, children]);

  return (
    <Box
      // Padding and every height/width rule are the caller's: Tailwind classes of the same property
      // do not merge here, so anything a caller might need to override cannot be in the base
      // `justify-start`: `Box` centres its children, which on a panel taller than its rows floats
      // the board in the middle of its own frame
      className={clsx('min-h-0 w-full items-stretch justify-start gap-1.5 bg-black/50', className)}
      data-test={dataTest}>
      <Menu.SubHeader as="h2" className="text-active text-left text-base font-bold lg:text-lg">
        {title}
      </Menu.SubHeader>
      <Menu.HelpText className="text-left text-xs opacity-70 lg:text-sm">{subtitle}</Menu.HelpText>
      {/* `min-h-0` so this is what shrinks when the panel is capped, rather than overflowing it */}
      {/* `flex-1` only when there is something to fill with: otherwise the list would stretch to the
          panel's full height and leave a board with three rows floating in a tall empty frame.
          The mask fades whatever the bottom edge cuts through, so a row the list ran out of room for
          reads as more below rather than as a row that failed to draw. It falls on empty space, and
          so is invisible, when everything fits. */}
      <div
        ref={listRef}
        className={clsx(
          'flex min-h-0 flex-col gap-1 overflow-y-auto',
          '[mask-image:linear-gradient(to_bottom,black_calc(100%-1.25rem),transparent)]',
          fill && 'flex-1',
        )}>
        {children}
        {fill && Array.from({ length: Math.max(0, rowsThatFit) }, (_, index) => fill(index))}
      </div>
    </Box>
  );
}

export default ScoreboardPanel;
