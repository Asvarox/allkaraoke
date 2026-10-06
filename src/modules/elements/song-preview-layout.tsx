import { createContext, ReactNode, use, useState } from 'react';
import { createPortal } from 'react-dom';

import { ScrollableColumn } from '~/modules/elements/akui/scrollable-container';
import { usePhoneOrientation } from '~/modules/hooks/use-breakpoint';

interface Props {
  /**
   * Expanded is the opened song preview, filling the screen. Collapsed is the small card in the song
   * list, which only lays out the thumbnail and its footer.
   */
  expanded: boolean;
  /** Not drawn: the title carries the way back. Kept so both preview layouts take the same props */
  back?: ReactNode;
  title: ReactNode;
  artist: ReactNode;
  /**
   * The thumbnail (a video player). It keeps a fixed position in the tree across
   * expand/collapse so the YouTube iframe inside it is never unmounted — which is why the wrappers
   * around it fall back to `display: contents` rather than disappearing when collapsed.
   */
  thumbnail: ReactNode;
  /** The card's own footer in the song list: title, artist and badges over the small card. */
  collapsedFooter?: ReactNode;
  /**
   * The song settings. Their parts are cells of the same grid, placed with `SongPreviewLayout.area`;
   * the actions and the panels go through `SongPreviewLayout.Slot`, as a phone keeps them out of the
   * scrolling column the rest of the settings are in.
   */
  footer?: ReactNode;
}

/** Where the song settings' parts go in the expanded grid. On a phone the players and the
 * leaderboard share one tabbed area; on the widest layout Setup mics sits under the players. */
const songPreviewArea = {
  // At the bottom of what the column has left. On a phone they scroll with the rest of the column;
  // wider, they keep their height and the video shrinks instead
  settings:
    '[grid-area:settings] min-w-0 grid-cols-1 lg:landscape:max-h-full lg:landscape:min-h-auto lg:landscape:self-end lg:landscape:overflow-visible',
  // Upright on a phone it scrolls with the column, so it's as tall as its content — but not a stub
  panels:
    '[grid-area:panels] md:portrait:contents lg:landscape:contents max-md:portrait:min-h-64 max-md:portrait:shrink-0',
  players: 'md:portrait:[grid-area:players] lg:landscape:[grid-area:players]',
  board: 'md:portrait:[grid-area:board] lg:landscape:[grid-area:board]',
  actions: '[grid-area:actions] lg:landscape:contents',
  mics: 'lg:landscape:[grid-area:mics]',
  play: 'lg:landscape:[grid-area:play]',
} as const;

/** One grid, four arrangements picked by the screen's shape. Exactly the screen's height, so long
 * lists scroll inside their panels — on a phone the song and its settings scroll as one column. */
const EXPANDED_GRID = [
  'grid h-full shrink-0 gap-3 max-lg:landscape:gap-2 lg:landscape:gap-4',
  // Phone, upright: the title, then the song, its settings and the tabbed panel scrolling, Play at the bottom
  "grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] [grid-template-areas:'info'_'scroll'_'actions']",
  // Phone, sideways: the title, the scrolling song and settings, and Play down the left, the tabbed panel
  // beside them. Every pixel of height counts here, so the controls in that column are a size down
  "max-lg:landscape:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] max-lg:landscape:grid-rows-[auto_minmax(0,1fr)_auto] max-lg:landscape:[grid-template-areas:'info_panels'_'scroll_panels'_'actions_panels']",
  // Tablet, upright: the title across the top, the song beside its settings, then the players and the
  // leaderboard side by side
  "md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_auto_minmax(16rem,1fr)_auto] md:portrait:[grid-template-areas:'info_info'_'video_settings'_'players_board'_'actions_actions']",
  // Tablet sideways, and desktop: the song's title across the top as the dialog's header, then players,
  // the video with its settings, leaderboard. Short of height, the video gives way first
  "lg:landscape:grid-cols-[minmax(0,11fr)_minmax(0,10fr)_minmax(0,10fr)] lg:landscape:grid-rows-[auto_minmax(0,auto)_1fr_auto] lg:landscape:[grid-template-areas:'info_info_info'_'players_video_board'_'players_settings_board'_'mics_play_board']",
].join(' ');

/** The title and artist; held upright, just clear of the app's toolbar in the corner beside them */
const INFO_CLASS = 'flex min-w-0 flex-col gap-1 self-start [grid-area:info] portrait:pr-22 md:portrait:pr-25';

/** The column a phone scrolls. The margin and padding pair leaves a focused switcher room to grow
 * without being clipped by the scrollport. */
const SCROLL_CLASS = '[grid-area:scroll] -mx-2';
const SCROLL_CONTENT_CLASS = 'gap-3 px-2 py-1 *:shrink-0 max-lg:landscape:gap-2';

type SlotName = 'actions' | 'panels';
const SlotsContext = createContext<Record<SlotName, HTMLElement | null> | null>(null);

/** Puts a part of the settings where the layout wants it — on a phone, outside the scrolling column */
function Slot({ name, children }: { name: SlotName; children: ReactNode }) {
  const slots = use(SlotsContext);
  if (!slots) return children;
  const target = slots[name];
  return target ? createPortal(children, target) : null;
}

/** The opened song preview: the song and its settings, the players about to sing it, and its
 * leaderboard. Every part is a slot, and the settings' own parts are cells of the same grid. */
export default function SongPreviewLayout({ expanded, title, artist, thumbnail, collapsedFooter, footer }: Props) {
  const phone = usePhoneOrientation();
  const scrolls = expanded && phone !== null;
  const [actionsSlot, setActionsSlot] = useState<HTMLElement | null>(null);
  const [scrollingPanelsSlot, setScrollingPanelsSlot] = useState<HTMLElement | null>(null);
  const [panelsSlot, setPanelsSlot] = useState<HTMLElement | null>(null);
  // Held sideways the panel stays beside the scrolling column; everywhere else it's in the column,
  // which wider than a phone is no box of its own
  const slots = { actions: actionsSlot, panels: phone === 'landscape' ? panelsSlot : scrollingPanelsSlot };

  return (
    <>
      <div className={expanded ? EXPANDED_GRID : 'contents'}>
        {expanded && (
          <div className={INFO_CLASS}>
            {title}
            {artist}
          </div>
        )}
        <ScrollableColumn
          className={scrolls ? SCROLL_CLASS : 'contents'}
          contentClassName={scrolls ? SCROLL_CONTENT_CLASS : 'contents'}
          arrows={scrolls}>
          <div className={expanded ? 'min-w-0 [grid-area:video]' : 'contents'}>{thumbnail}</div>
          <SlotsContext value={slots}>{expanded && footer}</SlotsContext>
          {expanded && <div ref={setScrollingPanelsSlot} className="contents" />}
        </ScrollableColumn>
        {expanded && <div ref={setPanelsSlot} className="contents" />}
        {expanded && <div ref={setActionsSlot} className="contents" />}
      </div>
      {!expanded && collapsedFooter}
    </>
  );
}

SongPreviewLayout.area = songPreviewArea;
SongPreviewLayout.Slot = Slot;
