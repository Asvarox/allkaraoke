import { ReactNode } from 'react';

interface Props {
  /**
   * Expanded is the opened song preview, filling the screen. Collapsed is the small card in the song
   * list, which only lays out the thumbnail and its footer.
   */
  expanded: boolean;
  /** The way back out. Expanded only. */
  back?: ReactNode;
  title: ReactNode;
  artist: ReactNode;
  /**
   * The thumbnail (a video player). It keeps a fixed position in the tree across
   * expand/collapse so the YouTube iframe inside it is never unmounted — which is why the wrapper
   * below falls back to `display: contents` rather than disappearing when collapsed.
   */
  thumbnail: ReactNode;
  /** The card's own footer in the song list: title, artist and badges over the small card. */
  collapsedFooter?: ReactNode;
  /** The song settings. Their parts are cells of the same grid, placed with `SongPreviewLayout.area`. */
  footer?: ReactNode;
}

/** Where the song settings' parts go in the expanded grid. On a phone the players and the
 * leaderboard share one tabbed area; on the widest layout Setup mics sits under the players. */
const songPreviewArea = {
  // At the bottom of what the column has left. On a phone held sideways they scroll when that isn't
  // enough for a duet's track switchers; wider, they keep their height and the video shrinks instead
  settings:
    '[grid-area:settings] min-w-0 grid-cols-1 landscape:max-h-full landscape:self-end lg:landscape:min-h-auto lg:landscape:overflow-visible',
  panels: '[grid-area:panels] md:portrait:contents lg:landscape:contents',
  players: 'md:portrait:[grid-area:players] lg:landscape:[grid-area:players]',
  board: 'md:portrait:[grid-area:board] lg:landscape:[grid-area:board]',
  actions: '[grid-area:actions] lg:landscape:contents',
  mics: 'lg:landscape:[grid-area:mics]',
  play: 'lg:landscape:[grid-area:play]',
} as const;

/** One grid, four arrangements picked by the screen's shape. Exactly the screen's height, so long
 * lists scroll inside their panels; a screen too short for the fixed rows scrolls the card instead. */
const EXPANDED_GRID = [
  'grid h-full shrink-0 gap-3 max-lg:landscape:gap-2 lg:landscape:gap-4',
  // Phone, upright: the song over its settings, the tabbed panel, Play at the bottom
  "grid-cols-1 grid-rows-[auto_auto_auto_minmax(16rem,1fr)_auto] [grid-template-areas:'video'_'info'_'settings'_'panels'_'actions']",
  // Phone, sideways: the song and its settings down the left, the tabbed panel beside them. Every
  // pixel of height counts here, so the controls in that column are a size down
  "max-lg:landscape:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] max-lg:landscape:grid-rows-[auto_auto_minmax(0,1fr)_auto] max-lg:landscape:[grid-template-areas:'video_panels'_'info_panels'_'settings_panels'_'actions_panels']",
  // Tablet, upright: the song across the top, the players and the leaderboard side by side under it
  "md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_auto_minmax(16rem,1fr)_auto] md:portrait:[grid-template-areas:'video_info'_'video_settings'_'players_board'_'actions_actions']",
  // Tablet sideways, and desktop: the song's title across the top as the dialog's header, then players,
  // the video with its settings, leaderboard. Short of height, the video gives way first
  "lg:landscape:grid-cols-[minmax(0,11fr)_minmax(0,10fr)_minmax(0,10fr)] lg:landscape:grid-rows-[auto_minmax(0,auto)_1fr_auto] lg:landscape:[grid-template-areas:'info_info_info'_'players_video_board'_'players_settings_board'_'mics_play_board']",
].join(' ');

/** Over the video's corner; on the widest layout the title carries it instead. */
const BACK_CLASS = 'z-2 m-2 self-start justify-self-start [grid-area:video] lg:landscape:hidden';

/** Under the video; on an upright tablet clear of the app's toolbar, which sits in the corner above it. */
const INFO_CLASS = 'flex min-w-0 flex-col gap-1 self-start [grid-area:info] md:portrait:pt-12';

/** The opened song preview: the song and its settings, the players about to sing it, and its
 * leaderboard. Every part is a slot, and the settings' own parts are cells of the same grid. */
export default function SongPreviewLayout({
  expanded,
  back,
  title,
  artist,
  thumbnail,
  collapsedFooter,
  footer,
}: Props) {
  return (
    <>
      <div className={expanded ? EXPANDED_GRID : 'contents'}>
        {expanded && back && <div className={BACK_CLASS}>{back}</div>}
        <div className={expanded ? 'min-w-0 [grid-area:video]' : 'contents'}>{thumbnail}</div>
        {expanded && (
          <div className={INFO_CLASS}>
            {title}
            {artist}
          </div>
        )}
        {expanded && footer}
      </div>
      {!expanded && collapsedFooter}
    </>
  );
}

SongPreviewLayout.area = songPreviewArea;
