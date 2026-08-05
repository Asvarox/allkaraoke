import { useCallback, useEffect, useRef } from 'react';

import { Chip } from '~/modules/elements/akui/chip';
import { Icon } from '~/modules/elements/akui/icon';
import VideoPlayer, { VideoPlayerRef, VideoState } from '~/modules/elements/video-player/index';
import { SongHoverPreview } from '~/modules/online/protocol/types';
import RoomCodePanel from '~/routes/online/lobby/room-code-panel';
import SongFlag from '~/routes/sing-a-song/song-selection/components/song-card/song-flag';

interface Props {
  /** What the host is browsing, or the song already selected — null before anything is picked. */
  preview: SongHoverPreview | null;
  roomCode: string;
}

/** Same 30s window the song list previews when the host hasn't sent an explicit end. */
const PREVIEW_LENGTH = 30;

/** Top half of the lobby, laid out like the expanded song preview: title/artist (plus the room
 * code) on the left, the looping video — with the song's details under it — on the right. */
function LobbySongHeader({ preview, roomCode }: Props) {
  const player = useRef<VideoPlayerRef | null>(null);
  const video = preview?.video;
  const start = preview?.previewStart ?? 0;
  const end = preview?.previewEnd ?? start + PREVIEW_LENGTH;

  // Driven by the ref (rather than the `video` prop) so the preview window can be bounded — that's
  // what makes ENDED fire, which is what loops it, exactly as the song list does. The YouTube iframe
  // API may not be up on the first run (getInternalPlayer() is null until then), so keep retrying.
  useEffect(() => {
    if (!video) return;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const load = () => {
      if (cancelled) return;
      try {
        player.current?.loadVideoById({ videoId: video, startSeconds: start, endSeconds: end });
        player.current?.playVideo();
      } catch {
        retry = setTimeout(load, 200);
      }
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(retry);
    };
  }, [video, start, end]);

  const onVideoStateChange = useCallback(
    (state: VideoState) => {
      if (state === VideoState.ENDED) {
        player.current?.seekTo(start);
        player.current?.playVideo();
      }
    },
    [start],
  );

  return (
    <div
      className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:justify-between sm:gap-12"
      data-test="online-host-browsing">
      {/* Half the row, exactly like the singer list below it — so the room code and invite link line
          up with the singer rows */}
      <div className="flex w-full min-w-0 flex-col gap-1 sm:w-1/2 sm:gap-3">
        <span
          className="typography text-active truncate text-xl leading-tight font-bold sm:text-3xl"
          data-test="online-host-browsing-title">
          {preview?.title ?? 'No song yet'}
        </span>
        <span className="typography text-md truncate leading-tight sm:text-xl" data-test="online-host-browsing-artist">
          {preview?.artist ?? 'The host picks the song'}
        </span>
        <RoomCodePanel roomCode={roomCode} className="mt-2 sm:mt-4" />
      </div>
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-2/5">
        <div className="relative isolate flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-[#2b2b2b]">
          {video ? (
            <VideoPlayer
              ref={player}
              video=""
              width={480}
              height={270}
              volume={preview?.volume}
              disablekb
              onStateChange={onVideoStateChange}
            />
          ) : (
            <Icon icon="ic:baseline-search" size={12} className="opacity-25" />
          )}
        </div>
        {preview && (
          <div className="flex flex-wrap items-center gap-1" data-test="online-host-browsing-details">
            {preview.language?.length ? (
              <SongFlag song={{ language: preview.language, artistOrigin: preview.artistOrigin }} chip />
            ) : null}
            {preview.year && <Chip>{preview.year}</Chip>}
            <Chip className="[&_svg]:h-4 [&_svg]:w-4">
              <Icon icon="ic:baseline-games" width="1rem" height="1rem" />
              <span>{preview.mode ?? 'Duel'}</span>
            </Chip>
            {preview.difficulty && (
              <Chip className="[&_svg]:h-4 [&_svg]:w-4">
                <Icon icon="ic:baseline-speed" width="1rem" height="1rem" />
                <span>{preview.difficulty}</span>
              </Chip>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LobbySongHeader;
