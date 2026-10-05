import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { SingSetup, SongPreview } from '~/interfaces';
import { Backdrop } from '~/modules/elements/akui/backdrop';
import { Button } from '~/modules/elements/akui/button';
import { Icon } from '~/modules/elements/akui/icon';
import { dialogSurface } from '~/modules/elements/akui/surfaces';
import SongPreviewLayout from '~/modules/elements/song-preview-layout';
import SongPreviewLayoutLegacy from '~/modules/elements/song-preview-layout-legacy';
import VideoPlayer, { VideoPlayerRef, VideoState } from '~/modules/elements/video-player/index';
import useDebounce from '~/modules/hooks/use-debounce';
import { isEurovisionSong } from '~/modules/songs/utils/special-songs-theme-checks';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import { SongCard } from '~/routes/sing-a-song/song-selection/components/song-card';
import SongSettings from '~/routes/sing-a-song/song-selection/components/song-settings/index';
import SongSettingsLegacy from '~/routes/sing-a-song/song-selection/components/song-settings/legacy/song-settings';
import useSongPreviewRedesign from '~/routes/sing-a-song/song-selection/hooks/use-song-preview-redesign';
import { useSpecialTheme } from '~/routes/sing-a-song/song-selection/hooks/use-special-theme';
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
  forceFlag: boolean;
  onExpand: () => void;
}

const PREVIEW_LENGTH = 30;

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
  forceFlag,
  onExpand,
}: Props) {
  const [showVideo, setShowVideo] = useState(false);
  const player = useRef<VideoPlayerRef | null>(null);
  const thumbnailRef = useRef<HTMLDivElement | null>(null);
  const thumbnailSize = useRef<{ w: number; h: number } | null>(null);
  useSpecialTheme(songPreview, FeatureFlags.Eurovision, isEurovisionSong, 'eurovision');
  // The `song_preview_redesign` experiment's test arm; control is the preview before it, in the legacy files
  const redesign = useSongPreviewRedesign();
  const Layout = redesign ? SongPreviewLayout : SongPreviewLayoutLegacy;
  const Settings = redesign ? SongSettings : SongSettingsLegacy;

  const expanded = keyboardControl;

  // Keep the YouTube iframe sized to the thumbnail element at all times.
  // The Thumbnail is now always the same DOM element so this only needs to run once.
  // The ResizeObserver fires whenever the thumbnail resizes (e.g. on expand/collapse).
  useEffect(() => {
    const el = thumbnailRef.current;
    if (!el) return;
    const applySize = (w: number, h: number) => {
      thumbnailSize.current = { w, h };
      player.current?.setSize(w, h);
    };
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      applySize(Math.round(w), Math.round(h));
    });
    observer.observe(el);
    const { width: w, height: h } = el.getBoundingClientRect();
    applySize(Math.round(w), Math.round(h));
    return () => observer.disconnect();
  }, []);

  const start = songPreview.previewStart ?? (songPreview.videoGap ?? 0) + 60;
  const end = songPreview.previewEnd ?? start + PREVIEW_LENGTH;
  const songPreviewVolume = songPreview.manualVolume;
  const undebounced = useMemo(
    () => [songPreview.video, start, end, songPreviewVolume] as const,
    [songPreview.video, start, end, songPreviewVolume],
  );
  const [videoId, previewStart, previewEnd, volume] = useDebounce(undebounced, 350);

  // Hide immediately whenever the selected song changes; the PLAYING event in
  // onVideoStateChange will reveal the video once the new one has actually loaded.
  useLayoutEffect(() => {
    setShowVideo(false);
  }, [songPreview.video]);

  useEffect(() => {
    // Re-apply size here because the YouTube IFrame API may not have been ready
    // when setSize was first called via ResizeObserver (getInternalPlayer() returns
    // null until the player script finishes loading). This effect fires after the
    // 350 ms debounce by which time the API is reliably initialised.
    if (thumbnailSize.current) {
      player.current?.setSize(thumbnailSize.current.w, thumbnailSize.current.h);
    }
    player.current?.loadVideoById({
      videoId: videoId,
      startSeconds: previewStart,
      endSeconds: previewEnd,
    });
    player.current?.playVideo();
  }, [videoId, player, previewStart, previewEnd]);

  const onVideoStateChange = useCallback(
    (state: VideoState) => {
      if (state === VideoState.ENDED) {
        // Reload (rather than seekTo) so the endSeconds bound is re-established — a bare seek
        // doesn't reliably re-arm it, and the preview would play past `previewEnd` on the next loop.
        player.current?.loadVideoById({ videoId, startSeconds: previewStart, endSeconds: previewEnd });
        player.current?.playVideo();
      } else if (state === VideoState.PLAYING) {
        setShowVideo(true);
      }
    },
    [videoId, previewStart, previewEnd],
  );

  // Pointer and touch only — off the keyboard navigation, which has Backspace for this
  const backButton = redesign ? (
    <Button
      // The app toolbar's size, so the two corners match
      size={{ xs: 'mini', sm: 'small' }}
      leftIcon={<Icon icon="ic:baseline-arrow-back" />}
      onClick={onExitKeyboardControl}
      aria-label="Back to the song list"
      data-test="song-preview-back"
    />
  ) : (
    <button
      onClick={onExitKeyboardControl}
      className="text-active flex items-center gap-1.5 transition-colors hover:opacity-80">
      <Icon icon="ic:baseline-arrow-back" className="text-lg" />
      <span className="text-lg font-bold">Sing a song</span>
    </button>
  );

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

      {/* Backdrop — only shown when expanded */}
      {expanded && <Backdrop className="z-expanded-backdrop" onClick={onExitKeyboardControl} />}

      <SongCard
        song={songPreview}
        isPopular={isPopular}
        forceFlag={forceFlag}
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
          expanded && !redesign
            ? `${dialogSurface} z-expanded fixed inset-0 overflow-y-auto rounded-none p-3 transition-none sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:h-auto sm:min-h-[72vh] sm:w-[min(90vw,72rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-hidden sm:rounded-2xl sm:p-4`
            : expanded
              ? cn(
                  dialogSurface,
                  'z-expanded fixed inset-0 overflow-y-auto rounded-none p-3 transition-none md:portrait:p-5 max-lg:landscape:py-2',
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

        <Layout
          expanded={expanded}
          back={backButton}
          title={
            <div className="flex min-w-0 items-center gap-2">
              {/* The dialog's own way back, beside its title — on smaller layouts it sits over the video */}
              <button
                onClick={onExitKeyboardControl}
                aria-label="Back to the song list"
                className={cn(
                  'text-active hidden shrink-0 cursor-pointer items-center',
                  redesign ? 'portrait:flex lg:landscape:flex' : 'sm:flex',
                )}>
                <Icon icon="ic:baseline-arrow-back" className={redesign ? 'text-2xl' : 'text-xl md:text-2xl'} />
              </button>
              <SongCard.SongTitle
                className={
                  redesign
                    ? 'typography max-lg:landscape:text-md line-clamp-2 min-w-0 flex-1 whitespace-normal! [view-transition-name:song-preview-title] md:portrait:text-xl max-lg:landscape:line-clamp-1 lg:landscape:text-xl'
                    : 'typography min-w-0 flex-1 truncate text-xl! [view-transition-name:song-preview-title] sm:text-3xl!'
                }
              />
            </div>
          }
          artist={
            <SongCard.Artist
              className={
                redesign
                  ? 'typography md:portrait:text-md! lg:landscape:text-md! text-sm! [view-transition-name:song-preview-artist]'
                  : 'typography text-md truncate [view-transition-name:song-preview-artist] sm:text-xl'
              }
            />
          }
          thumbnail={
            <SongCard.Thumbnail
              ref={thumbnailRef}
              className={cn(
                'w-full [view-transition-name:song-preview-thumbnail]',
                // Opened on the widest layout, as tall as its row, which gives way when the settings need the room
                expanded && redesign && 'lg:landscape:h-full lg:landscape:w-auto lg:landscape:max-w-full',
              )}>
              <div className={showVideo ? 'opacity-100 transition-opacity duration-500' : 'opacity-0'}>
                <VideoPlayer
                  width={0}
                  height={0}
                  disablekb
                  ref={player}
                  video={''}
                  volume={volume}
                  onStateChange={onVideoStateChange}
                />
              </div>
            </SongCard.Thumbnail>
          }
          collapsedFooter={
            <SongCard.Footer>
              <SongCard.SongTitle className="[view-transition-name:song-preview-title]" />
              <SongCard.Artist className="[view-transition-name:song-preview-artist]" />
              <SongCard.Badges>
                <SongCard.Badges.Flag />
                <SongCard.Badges.Duet />
                <SongCard.Badges.Stats focused compact />
              </SongCard.Badges>
            </SongCard.Footer>
          }
          footer={
            <Settings
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
