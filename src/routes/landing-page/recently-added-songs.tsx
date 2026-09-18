import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { chunk } from 'es-toolkit';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import Box from '~/modules/elements/akui/primitives/box';
import Typography from '~/modules/elements/akui/primitives/typography';
import isE2E from '~/modules/utils/is-e2-e';
import { cn } from '~/utils/cn';

import songStats from './song-stats.json';

dayjs.extend(relativeTime);

const PAGE_SIZE = 4;
const PAGE_DURATION_MS = 6_000;
const RECENT_WINDOW_DAYS = 30;

/**
 * Summed from the per-day tally at render time rather than read as a number baked into the stats
 * file: that file is regenerated every few days at most, and a count frozen at generation time
 * would keep counting songs that have since dropped out of the window.
 */
const songsAddedRecently = Object.entries(songStats.additionsPerDay)
  .filter(([day]) => dayjs(day).isAfter(dayjs().subtract(RECENT_WINDOW_DAYS, 'days')))
  .reduce((total, [, count]) => total + count, 0);

// Only whole pages: a last page of one or two songs would leave the row half empty every time the
// rotation came round to it.
const pages = chunk(songStats.recentlyAdded, PAGE_SIZE).filter((page) => page.length === PAGE_SIZE);

const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

/**
 * Dropped in the one range where this panel is on screen and the card above it has already given
 * up: from `xl` to 1600px the leaderboard rail takes 32rem out of the row, which is what pushes the
 * landing page's screenshots below its copy — and leaves a quarter of what is left too narrow for a
 * still and a song title both. The stills and the page dots go, the titles stay.
 *
 * Spelled out rather than built from a template because Tailwind finds arbitrary utilities by
 * scanning the source for the literal text, and written to match the card's own `xl:max-[1599px]`
 * pair so the two switch on the same pixel.
 */
const WIDE_TEXT_COLUMN = 'xl:max-[1599px]:hidden';

/**
 * The row's height, spelled out rather than left to the three lines of text inside it. `mode="wait"`
 * unmounts the page that is leaving before the next one mounts, so for one frame the grid has no
 * children — and a row sized by its contents collapses to nothing there, taking the footer up with
 * it and putting it straight back. 5rem is what those three lines and the tile's padding measure.
 */
const TILE_HEIGHT = 'h-20';

/**
 * Dissolves the still into the tile instead of ending it on a hard edge under the text. The stop is
 * past where the text begins, so the letters sitting on the picture are over its faintest part and
 * the cut itself is never a line the eye can find.
 */
const OVERLAP_FADE = 'linear-gradient(to right, #000 40%, transparent 95%)';

/**
 * The page as a whole only carries the timing: the four tiles are what actually move, one after the
 * next, so a swap reads as a row being dealt rather than a block being replaced. Exit runs in
 * reverse so the tile that left last is the first to come back.
 */
const pageVariants = {
  initial: { transition: { staggerChildren: 0.05 } },
  animate: { transition: { staggerChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const tileVariants = {
  initial: { opacity: 0, translateY: 12 },
  animate: { opacity: 1, translateY: 0 },
  exit: { opacity: 0, translateY: -12 },
};

/**
 * The newest songs, four at a time, rotating through the {@link pages} the stats file carries. It
 * stands where the stat tiles used to: the one thing this page can show that is different on every
 * visit is the catalogue growing, and a number saying so is weaker than the songs themselves.
 *
 * Frozen on the first page in e2e — a panel that changes on a timer is a screenshot that races it.
 */
function RecentlyAddedSongs({ className }: { className?: string }) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (isE2E() || pages.length < 2) return;

    const interval = setInterval(() => setPage((current) => (current + 1) % pages.length), PAGE_DURATION_MS);
    return () => clearInterval(interval);
  }, []);

  if (pages.length === 0) return null;

  return (
    <Box
      className={cn('shrink-0 items-stretch justify-start gap-3 p-4 xl:p-5', className)}
      data-test="recently-added-songs">
      <div className="flex items-baseline gap-3">
        {/* The count is the heading — the four songs under it say "recently added" better than a
            title would, and the row has the height for one line, not two. */}
        <Menu.HelpText as="h2" className="min-w-0 flex-1 text-left">
          <strong>{formatter.format(songsAddedRecently)} songs</strong> added in the last{' '}
          <strong>{RECENT_WINDOW_DAYS} days</strong>
        </Menu.HelpText>
        {/* Which page of the rotation this is — without it the row looks like it reshuffles itself
            at random rather than walking through a list. */}
        <div className={`flex shrink-0 gap-1.5 ${WIDE_TEXT_COLUMN}`}>
          {pages.map((_, index) => (
            <span
              key={index}
              className={cn('size-1.5 rounded-full transition-colors', index === page ? 'bg-active' : 'bg-white/25')}
            />
          ))}
        </div>
      </div>

      {/* `mode="wait"` rather than a crossfade: the two pages occupy the same four cells, and
          overlapping them would draw eight songs on top of each other for the length of the swap. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          className={`grid grid-cols-4 gap-3 xl:gap-4 ${TILE_HEIGHT}`}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit">
          {pages[page].map((song) => (
            <motion.div
              key={`${song.artist}-${song.title}`}
              variants={tileVariants}
              transition={{ duration: 0.25 }}
              className="relative flex h-full min-w-0 items-stretch overflow-hidden rounded-lg bg-black/40 p-2"
              data-test="recently-added-song">
              {/* The same YouTube still the song cards use, so a song looks like itself on both
                  screens. `alt=""` — the title and artist are right beside it.

                  Kept at 16:9 and as tall as the row allows, which only works because the row's
                  height is fixed above: a still sized from its own height inside a row sized by its
                  contents has nothing to resolve against. Wide enough at that ratio to crowd the
                  text, so the text is laid over its trailing edge rather than beside it — the way
                  the rest of the app puts copy over video instead of shrinking the picture. */}
              <img
                src={`https://i3.ytimg.com/vi/${song.video}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                style={{ maskImage: OVERLAP_FADE }}
                className={`-mr-6 aspect-video h-full w-auto shrink-0 rounded-md border-1 border-black bg-[#2b2b2b] object-cover ${WIDE_TEXT_COLUMN}`}
              />
              {/* The overlap is the still's own `-mr-6`, not a pull on this column: hiding the
                  still has to take the overlap with it, or the text starts outside the tile's
                  padding. `text-shadow-legible` is what carries the first letter or two that still
                  land on the picture. */}
              <div className="text-shadow-legible relative z-10 flex min-w-0 flex-col justify-center">
                <Typography className="text-md truncate leading-tight font-bold">{song.title}</Typography>
                <Typography className="truncate text-sm leading-snug opacity-75">{song.artist}</Typography>
                {/* Truncated rather than wrapped: a second line here and not on the tile beside it
                    would make the row's height change with whichever page is up. */}
                <Typography className="text-active truncate text-xs leading-snug">
                  added {dayjs(song.addedAt).fromNow()}
                </Typography>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}

export default RecentlyAddedSongs;
