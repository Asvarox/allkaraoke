import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '~/modules/elements/akui/button';
import { Chip } from '~/modules/elements/akui/chip';
import { Icon } from '~/modules/elements/akui/icon';
import SongPreviewLayout from '~/modules/elements/song-preview-layout';
import VideoPlayer, { VideoPlayerRef, VideoState } from '~/modules/elements/video-player/index';
import { SongHoverPreview } from '~/modules/online/protocol/types';
import RoomCodePanel from '~/routes/online/lobby/room-code-panel';
import SongFlag from '~/routes/sing-a-song/song-selection/components/song-card/song-flag';

interface Props {
  /** What the host is browsing, or the song already selected — null before anything is picked. */
  preview: SongHoverPreview | null;
  roomCode: string;
  /** Host only, and only while nothing is picked — turns the empty thumbnail into the way to pick. */
  onChooseSong?: () => void;
  /** The row under the card: the room's singers and what everyone can do about the song. */
  footer: ReactNode;
}

/** Same 30s window the song list previews when the host hasn't sent an explicit end. */
const PREVIEW_LENGTH = 30;

/** The lobby as a song card: the same layout the song list expands a song into, with the room code
 * under the title and the singers where the mic check sits. */
function LobbySongCard({ preview, roomCode, onChooseSong, footer }: Props) {
  const player = useRef<VideoPlayerRef | null>(null);
  const video = preview?.video;
  const start = preview?.previewStart ?? 0;
  const end = preview?.previewEnd ?? start + PREVIEW_LENGTH;

  // The player only exists while there is a video, so each new one starts unready
  const [playerReady, setPlayerReady] = useState(false);
  useEffect(() => {
    if (!video) setPlayerReady(false);
  }, [video]);

  // Driven by the ref (rather than the `video` prop) so the preview window can be bounded — that's
  // what makes ENDED fire, which is what loops it, exactly as the song list does. Held until the
  // player reports itself ready: commands sent before that are posted to an iframe that isn't
  // listening yet, and are dropped without an error, leaving the thumbnail black for good.
  useEffect(() => {
    if (!video || !playerReady) return;
    player.current?.loadVideoById({ videoId: video, startSeconds: start, endSeconds: end });
    player.current?.playVideo();
  }, [video, start, end, playerReady]);

  const onVideoStateChange = useCallback(
    (state: VideoState) => {
      if (state === VideoState.ENDED && video) {
        // Reload (rather than seekTo) so the endSeconds bound is re-established — a bare seek
        // doesn't reliably re-arm it, and the preview would play past `end` on the next loop.
        player.current?.loadVideoById({ videoId: video, startSeconds: start, endSeconds: end });
        player.current?.playVideo();
      }
    },
    [video, start, end],
  );

  return (
    <SongPreviewLayout
      expanded
      title={
        <span
          className="typography text-active truncate text-xl leading-tight font-bold sm:text-3xl"
          data-test="online-host-browsing-title">
          {preview?.title ?? 'No song yet'}
        </span>
      }
      artist={
        <span className="typography text-md truncate leading-tight sm:text-xl" data-test="online-host-browsing-artist">
          {preview?.artist ?? 'The host picks the song'}
        </span>
      }
      underTitle={<RoomCodePanel roomCode={roomCode} className="mt-2 sm:mt-4" />}
      thumbnail={
        <div className="relative isolate flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-[#2b2b2b]">
          {video ? (
            <VideoPlayer
              ref={player}
              video=""
              width={480}
              height={270}
              volume={preview?.volume}
              disablekb
              onReady={() => setPlayerReady(true)}
              onStateChange={onVideoStateChange}
            />
          ) : onChooseSong ? (
            // An empty thumbnail is the most obvious place to look for the song — so it's the button
            <Button
              size="small"
              fullWidth={false}
              className="w-auto px-6"
              leftIcon={<Icon icon="ic:baseline-search" size={6} />}
              onClick={onChooseSong}
              data-test="thumbnail-choose-song-button">
              Select song
            </Button>
          ) : (
            <Icon icon="ic:baseline-search" size={12} className="opacity-25" />
          )}
        </div>
      }
      underThumbnail={
        preview && (
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
        )
      }
      footer={footer}
    />
  );
}

export default LobbySongCard;
