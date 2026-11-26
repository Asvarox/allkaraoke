import { RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { SongPreview } from '~/interfaces';
import { VideoPlayerRef, VideoState } from '~/modules/elements/video-player/index';
import useDebounce from '~/modules/hooks/use-debounce';
import { toInstrumentalTime } from '~/modules/songs/utils/to-instrumental-version';
import usePlayInstrumental from '~/routes/sing-a-song/song-selection/components/song-settings/use-play-instrumental';

const PREVIEW_LENGTH = 30;
// After the preview loops this many times, the whole song plays (still looped)
const PREVIEW_PLAYS_BEFORE_FULL_SONG = 2;
const DEBOUNCE_MS = 350;

/** The video to preview and where the preview is on it. Preview times are set on the original video */
const getPreviewPlayback = (songPreview: SongPreview, playInstrumental: boolean) => {
  const instrumental = playInstrumental ? songPreview.instrumental : undefined;
  const originalStart = songPreview.previewStart ?? (songPreview.videoGap ?? 0) + 60;
  const offset = instrumental ? toInstrumentalTime(songPreview, originalStart) - originalStart : 0;

  return {
    videoId: instrumental?.video ?? songPreview.video,
    start: Math.max(0, originalStart + offset),
    end: (songPreview.previewEnd ?? originalStart + PREVIEW_LENGTH) + offset,
    // Where the original preview moment is in this video, to resume at the same point when vocals are toggled
    offset,
    fullSongStart: (instrumental ? instrumental.videoGap : songPreview.videoGap) ?? 0,
  };
};

/**
 * Plays the song's preview on a loop, then the whole song, keeping the player sized to the thumbnail.
 * Toggling vocals switches the video and carries on from the same moment of the song.
 */
export function useSongPreviewVideo(songPreview: SongPreview, thumbnailRef: RefObject<HTMLDivElement | null>) {
  const [showVideo, setShowVideo] = useState(false);
  const player = useRef<VideoPlayerRef | null>(null);
  const thumbnailSize = useRef<{ w: number; h: number } | null>(null);

  // The thumbnail is always the same DOM element, so one observer follows it through expand/collapse
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
  }, [thumbnailRef]);

  const { playInstrumental } = usePlayInstrumental(songPreview);
  const playback = getPreviewPlayback(songPreview, playInstrumental);
  const songVolume = songPreview.manualVolume;
  // Debounced together, so a new song's video, timings and volume all apply at once
  const undebounced = useMemo(
    () =>
      [
        playback.videoId,
        playback.start,
        playback.end,
        playback.offset,
        playback.fullSongStart,
        songVolume,
        songPreview.id,
      ] as const,
    [
      playback.videoId,
      playback.start,
      playback.end,
      playback.offset,
      playback.fullSongStart,
      songVolume,
      songPreview.id,
    ],
  );
  const [videoId, start, end, offset, fullSongStart, volume, songId] = useDebounce(undebounced, DEBOUNCE_MS);

  // What's playing now, so toggling vocals can resume the other video at the same point of the song
  const loaded = useRef<{ songId: string; videoId: string; offset: number } | null>(null);
  // Lives here, not in the player, so expanding or collapsing the preview doesn't reset it
  const previewPlays = useRef(0);
  const [playingFullSong, setPlayingFullSong] = useState(false);

  // Hide as soon as the video changes; the PLAYING event reveals it once the new one has loaded
  useLayoutEffect(() => {
    setShowVideo(false);
  }, [playback.videoId]);

  useEffect(() => {
    // The YouTube API may not have been ready for the first setSize; by the end of the debounce it is
    if (thumbnailSize.current) {
      player.current?.setSize(thumbnailSize.current.w, thumbnailSize.current.h);
    }
    const previous = loaded.current;
    loaded.current = { songId, videoId, offset };

    const switchedVersion = previous?.songId === songId && previous.videoId !== videoId;
    if (switchedVersion) {
      void player.current?.getCurrentTime().then((time) => {
        const startSeconds = Math.max(0, time - previous.offset + offset);
        const isInPreview = previewPlays.current < PREVIEW_PLAYS_BEFORE_FULL_SONG && startSeconds < end;
        player.current?.loadVideoById({ videoId, startSeconds, endSeconds: isInPreview ? end : undefined });
        player.current?.playVideo();
      });
      return;
    }

    previewPlays.current = 0;
    setPlayingFullSong(false);
    player.current?.loadVideoById({ videoId, startSeconds: start, endSeconds: end });
    player.current?.playVideo();
  }, [videoId, start, end, songId, offset]);

  const onStateChange = useCallback(
    (state: VideoState) => {
      if (state === VideoState.ENDED) {
        // Reload (rather than seekTo) so the endSeconds bound is re-armed for the next loop
        previewPlays.current++;
        if (previewPlays.current >= PREVIEW_PLAYS_BEFORE_FULL_SONG) {
          setPlayingFullSong(true);
          player.current?.loadVideoById({ videoId, startSeconds: fullSongStart });
        } else {
          player.current?.loadVideoById({ videoId, startSeconds: start, endSeconds: end });
        }
        player.current?.playVideo();
      } else if (state === VideoState.PLAYING) {
        setShowVideo(true);
      }
    },
    [videoId, start, end, fullSongStart],
  );

  return { player, showVideo, playingFullSong, videoId, previewStart: start, volume, onStateChange };
}

export type SongPreviewVideoState = ReturnType<typeof useSongPreviewVideo>;
