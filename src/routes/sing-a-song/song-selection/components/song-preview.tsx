import { ArrowBack } from '@mui/icons-material';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SingSetup, SongPreview } from '~/interfaces';
import VideoPlayer, { VideoPlayerRef, VideoState } from '~/modules/elements/video-player/index';
import useDebounce from '~/modules/hooks/use-debounce';
import { isEurovisionSong } from '~/modules/songs/utils/special-songs-theme-checks';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import useFeatureFlag from '~/modules/utils/use-feature-flag';
import { SongCard } from '~/routes/sing-a-song/song-selection/components/song-card';
import SongSettings from '~/routes/sing-a-song/song-selection/components/song-settings/index';
import { useSpecialTheme } from '~/routes/sing-a-song/song-selection/hooks/use-special-theme';

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
  const newVolumeFFEnabled = useFeatureFlag(FeatureFlags.NewVolume);

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
  const songPreviewVolume = newVolumeFFEnabled
    ? (songPreview.volume ?? songPreview.manualVolume)
    : songPreview.manualVolume;
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
        player.current?.seekTo(start);
        player.current?.playVideo();
      } else if (state === VideoState.PLAYING) {
        setShowVideo(true);
      }
    },
    [start],
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
      {expanded && (
        <div
          className="fixed inset-0 z-201 bg-black/50 bg-[radial-gradient(transparent_3px,rgba(0,0,0,0.5)_3px)] bg-size-[10px_10px] backdrop-blur-[20px]"
          onClick={onExitKeyboardControl}
        />
      )}

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
          'bg-slate-900 ' +
          (expanded
            ? 'fixed inset-0 z-202 overflow-y-auto rounded-none p-3 sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:h-auto sm:min-h-[72vh] sm:w-[min(90vw,72rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-hidden sm:rounded-2xl sm:p-4'
            : `absolute z-3 transition-opacity ${
                showVideo ? 'opacity-100 duration-300' : 'pointer-events-none opacity-0 duration-0'
              }`)
        }
        style={expanded ? {} : { width, height, top, left }}>
        {/* Click-capture overlay — collapsed only */}
        {!expanded && <div className="absolute inset-0 z-10 cursor-pointer" onClick={onExpand} />}

        {/* Back button — mobile only, shown when expanded */}
        {expanded && (
          <div className="mb-2 flex items-center sm:hidden">
            <button
              onClick={onExitKeyboardControl}
              className="text-active flex items-center gap-1.5 transition-colors hover:opacity-80">
              <ArrowBack />
              <span className="text-xl font-bold">Sing a song</span>
            </button>
          </div>
        )}

        {/*
          Keep SongCard.Thumbnail (and the VideoPlayer inside it) at a stable
          position in the React tree so the YouTube iframe is never unmounted
          when expanding/collapsing. In collapsed mode the wrapper uses
          `display: contents` so it is transparent to layout and the Thumbnail
          participates directly in SongCard's flex-col flow.
        */}
        <div className={expanded ? 'flex flex-col-reverse items-start gap-2 sm:flex-row sm:gap-24' : 'contents'}>
          {expanded && (
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-3">
              <SongCard.SongTitle className="typography truncate text-xl! [view-transition-name:song-preview-title] sm:text-3xl!" />
              <SongCard.Artist className="typography text-md truncate [view-transition-name:song-preview-artist] sm:text-xl" />
            </div>
          )}
          <SongCard.Thumbnail
            ref={thumbnailRef}
            className={`[view-transition-name:song-preview-thumbnail] ${expanded ? 'w-full shrink-0 sm:w-2/5' : undefined}`}>
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
        </div>

        {expanded ? (
          /* Settings row */
          <div className="mt-3 [view-transition-name:song-preview-content] sm:mt-auto">
            <SongSettings
              songPreview={songPreview}
              onPlay={onPlay}
              keyboardControl={keyboardControl}
              onExitKeyboardControl={onExitKeyboardControl}
            />
          </div>
        ) : (
          <SongCard.Footer>
            <SongCard.SongTitle className="[view-transition-name:song-preview-title]" />
            <SongCard.Artist className="[view-transition-name:song-preview-artist]" />
            <SongCard.Badges>
              <SongCard.Badges.Flag />
              <SongCard.Badges.Duet />
              <SongCard.Badges.Stats focused compact />
            </SongCard.Badges>
          </SongCard.Footer>
        )}
      </SongCard>
    </>
  );
}
