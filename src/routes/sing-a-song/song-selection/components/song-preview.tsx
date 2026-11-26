import { useRef } from 'react';

import { SingSetup, SongPreview } from '~/interfaces';
import { Backdrop } from '~/modules/elements/akui/backdrop';
import { Icon } from '~/modules/elements/akui/icon';
import { dialogSurface } from '~/modules/elements/akui/surfaces';
import { useBackground } from '~/modules/elements/background-context';
import SongPreviewLayout from '~/modules/elements/song-preview-layout';
import useDebounce from '~/modules/hooks/use-debounce';
import isE2E from '~/modules/utils/is-e2-e';
import PreviewLyrics from '~/routes/sing-a-song/song-selection/components/preview-lyrics/preview-lyrics';
import { SongCard } from '~/routes/sing-a-song/song-selection/components/song-card';
import SongPreviewVideo from '~/routes/sing-a-song/song-selection/components/song-preview-video';
import SongSettings from '~/routes/sing-a-song/song-selection/components/song-settings/index';
import { useSongPreviewVideo } from '~/routes/sing-a-song/song-selection/components/use-song-preview-video';
import { cn } from '~/utils/cn';

interface Props {
  songPreview: SongPreview;
  onPlay: (setup: SingSetup & { song: SongPreview }) => void;
  keyboardControl: boolean;
  onExitKeyboardControl: () => void;
  top: number;
  left: number;
  width: number;
  height: number;
  isPopular: boolean;
  onExpand: () => void;
}

export default function SongPreviewComponent({
  songPreview,
  top,
  left,
  width,
  height,
  keyboardControl,
  onExitKeyboardControl,
  onPlay,
  isPopular,
  onExpand,
}: Props) {
  const thumbnailRef = useRef<HTMLDivElement | null>(null);
  const video = useSongPreviewVideo(songPreview, thumbnailRef);
  const { player, showVideo } = video;
  const debouncedSong = useDebounce(songPreview, 350);
  useBackground(true, 'regular');

  const expanded = keyboardControl;

  const animationDurationSec =
    60 /
    (songPreview.realBpm && songPreview.realBpm > 40
      ? songPreview.realBpm
      : songPreview.bpm > 300
        ? songPreview.bpm / 4
        : songPreview.bpm / 2);

  return (
    <>
      {/* BPM rhythm shadow — sibling to SongCard so its scale animation isn't clipped by overflow-hidden */}
      {!expanded && showVideo && (
        <div
          className="pointer-events-none absolute z-2 hidden rounded-2xl bg-white opacity-0 blur-md md:block"
          style={{
            width,
            height,
            top,
            left,

            animationName: 'bpm',
            animationDelay: `${Math.ceil(0.3 / animationDurationSec) * animationDurationSec}s`, // sync to beat, starting on an even iteration
            animationDuration: `${animationDurationSec}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-out',
          }}
        />
      )}

      {/* Off in E2E runs, so focusing songs there doesn't also load each one for its lyrics */}
      {!expanded && !isE2E() && (
        <PreviewLyrics
          key={debouncedSong.id}
          songPreview={debouncedSong}
          instrumental={!!debouncedSong.instrumental && video.videoId === debouncedSong.instrumental.video}
          player={player}
          active={showVideo}
          playedFrom={video.playingFullSong ? -Infinity : video.previewStart * 1000}
          top={top}
          left={left}
          width={width}
          height={height}
        />
      )}

      {/* Backdrop — only shown when expanded */}
      {expanded && <Backdrop className="z-expanded-backdrop" onClick={onExitKeyboardControl} />}

      <SongCard
        song={songPreview}
        isPopular={isPopular}
        data-show-video={showVideo}
        data-expanded={expanded || undefined}
        data-song={songPreview.id}
        data-test="song-preview"
        focused={!expanded}
        className={
          // Only the expanded card is dialog-like. Collapsed, this is a tile in the grid and keeps
          // the bare fill — `dialogSurface`'s border would draw an edge around every song in the list.
          // Expanded it fills a phone or tablet, and on the widest layout is a large dialog, clear of the
          // app's toolbar above it, the same gap below (the keyboard help may overlap it). Its opening is the view transition's: the
          // card's own transitions would start it from the collapsed card's offset in the list, far below.
          expanded
            ? cn(
                dialogSurface,
                'z-expanded fixed inset-0 overflow-y-auto rounded-none p-3 transition-none max-md:portrait:pt-2 md:portrait:p-5 max-lg:landscape:py-2',
                'lg:landscape:top-16 lg:landscape:bottom-16 lg:landscape:mx-auto lg:landscape:h-auto lg:landscape:w-[min(94vw,110rem)] lg:landscape:rounded-2xl lg:landscape:px-6 lg:landscape:pt-6',
                'lg:landscape:pb-6',
              )
            : `absolute z-3 bg-slate-800 transition-opacity ${
                showVideo ? 'opacity-100 duration-300' : 'pointer-events-none opacity-0 duration-0'
              }`
        }
        style={expanded ? {} : { width, height, top, left }}>
        {/* Click-capture overlay — collapsed only */}
        {!expanded && <div className="absolute inset-0 z-10 cursor-pointer" onClick={onExpand} />}

        <SongPreviewLayout
          expanded={expanded}
          title={
            <div className="flex min-w-0 items-center gap-2">
              {/* The dialog's own way back, beside its title */}
              <button
                onClick={onExitKeyboardControl}
                aria-label="Back to the song list"
                className="text-active flex shrink-0 cursor-pointer items-center">
                <Icon
                  icon="ic:baseline-arrow-back"
                  // A step up from the title beside it, which is a size down on a phone
                  className="text-xl md:portrait:text-2xl max-lg:landscape:text-lg lg:landscape:text-2xl"
                />
              </button>
              <SongCard.SongTitle className="typography max-lg:landscape:text-md line-clamp-2 min-w-0 flex-1 whitespace-normal! [view-transition-name:song-preview-title] md:portrait:text-xl max-lg:landscape:line-clamp-1 lg:landscape:text-xl" />
            </div>
          }
          artist={
            <SongCard.Artist className="typography md:portrait:text-md! lg:landscape:text-md! text-sm! [view-transition-name:song-preview-artist]" />
          }
          thumbnail={
            <SongCard.Thumbnail
              ref={thumbnailRef}
              className={cn(
                'w-full [view-transition-name:song-preview-thumbnail]',
                // Opened on the widest layout, as tall as its row, which gives way when the settings need the room
                expanded && 'lg:landscape:h-full lg:landscape:w-auto lg:landscape:max-w-full',
              )}>
              <SongPreviewVideo video={video} />
            </SongCard.Thumbnail>
          }
          collapsedFooter={
            <SongCard.Footer>
              <SongCard.SongTitle className="[view-transition-name:song-preview-title]" />
              <SongCard.Artist className="[view-transition-name:song-preview-artist]" />
              <SongCard.Badges>
                <SongCard.Badges.Flag />
                <SongCard.Badges.Duet />
                <SongCard.Badges.Instrumental />
                <SongCard.Badges.Stats focused compact />
              </SongCard.Badges>
            </SongCard.Footer>
          }
          footer={
            <SongSettings
              key={songPreview.id}
              songPreview={songPreview}
              onPlay={onPlay}
              keyboardControl={keyboardControl}
              onExitKeyboardControl={onExitKeyboardControl}
            />
          }
        />
      </SongCard>
    </>
  );
}
