import clsx from 'clsx';
import { ReactNode } from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import Box from '~/modules/elements/akui/primitives/box';
import { Skeleton } from '~/modules/elements/akui/skeleton';

/**
 * Roughly five rows. Every board is this tall and the rest of its rows scroll — a fixed height keeps
 * the post-game step, which has the least room of the three screens, from pushing its own button off
 * the bottom.
 */
const LIST_HEIGHT = 'h-[15rem]';

/** Skeletons to draw while loading — one screenful of them. */
const LOADING_ROWS = 5;

interface Props {
  title: string;
  /** What the board covers — the heading has no room to say it. */
  subtitle: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  error?: unknown;
  /** Shown in place of the rows when the board has none. */
  emptyMessage?: string;
  isEmpty?: boolean;
  className?: string;
  /**
   * Classes for the scrolling list, for a caller that owns its own height — the main menu's rail is
   * as tall as the screen, and {@link LIST_HEIGHT} would leave it stopping a long way short.
   */
  listClassName?: string;
  'data-test'?: string;
}

/**
 * The surface every board sits on: a titled panel with a scrolling list of {@link ScoreboardRow}s.
 * All three use it — the local high scores and the song's global board on the post-game screen, and
 * the global board on the main menu — so a board looks like a board wherever it turns up.
 *
 * Loading, failed and empty are its states too, not each caller's: every board reaches them, and
 * three copies of the same skeleton is three places to forget.
 *
 * `Box` centres its children; this stacks them full width and top-aligned instead, and spells out
 * its own surface — `Box`'s `bg-black/30` is invisible against these screens, and the border is what
 * reads as an edge.
 */
function ScoreboardPanel({
  title,
  subtitle,
  children,
  isLoading,
  error,
  emptyMessage,
  isEmpty,
  className,
  listClassName,
  'data-test': dataTest,
}: Props) {
  return (
    <Box
      // Padding and every width rule are the caller's: Tailwind classes of the same property do not
      // merge here, so anything a caller might need to override cannot be in the base
      className={clsx('w-full items-stretch justify-start gap-1.5 bg-black/50', className)}
      data-test={dataTest}>
      <Menu.SubHeader as="h2" className="text-active text-left">
        {title}
      </Menu.SubHeader>
      <Menu.HelpText className="text-left">{subtitle}</Menu.HelpText>
      {/* The mask fades whatever the bottom edge cuts through, so a row the list ran out of room for
          reads as more below rather than as a row that failed to draw. It falls on empty space, and
          so is invisible, when everything fits. */}
      <div
        className={clsx(
          'flex flex-col gap-1 overflow-y-auto',
          '[mask-image:linear-gradient(to_bottom,black_calc(100%-1.25rem),transparent)]',
          LIST_HEIGHT,
          listClassName,
        )}>
        {isLoading &&
          Array.from({ length: LOADING_ROWS }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
        {!isLoading && !!error && <Menu.HelpText data-test="scoreboard-error">Failed to load results</Menu.HelpText>}
        {!isLoading && !error && isEmpty && <Menu.HelpText data-test="scoreboard-empty">{emptyMessage}</Menu.HelpText>}
        {!isLoading && !error && children}
      </div>
    </Box>
  );
}

export default ScoreboardPanel;
