import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useMeasure } from 'react-use';

import { Button } from '~/modules/elements/akui/button';
import { Chip } from '~/modules/elements/akui/chip';
import { Icon } from '~/modules/elements/akui/icon';
import VideoPlayer, { VideoPlayerRef, VideoState } from '~/modules/elements/video-player/index';
import { SongHoverPreview } from '~/modules/online/protocol/types';
import SongFlag from '~/routes/sing-a-song/song-selection/components/song-card/song-flag';

interface Props {
  /** What the host is browsing, or the song already selected — null before anything is picked. */
  preview: SongHoverPreview | null;
  /** The invite, under the picker. Omitted when the standings column beside the card carries it. */
  invite?: ReactNode;
  /** Who is choosing the song right now — `You` on their own screen. Null before anyone is host. */
  pickerName?: string | null;
  /** The song is settled — the header then says who picked it rather than who is picking. */
  picked?: boolean;
  /** Host only, and only while nothing is picked — turns the empty thumbnail into the way to pick. */
  onChooseSong?: () => void;
  /** The row under the card: what everyone can do about the song — vote, pick, start. */
  footer: ReactNode;
}

/** Same 30s window the song list previews when the host hasn't sent an explicit end. */
const PREVIEW_LENGTH = 30;

/** The lobby's middle column: the song's video and details, but led by who is picking — the song
 * may not exist yet — with the song's own title as a caption under the video. */
function LobbySongCard({ preview, invite, pickerName, picked = false, onChooseSong, footer }: Props) {
  const player = useRef<VideoPlayerRef | null>(null);
  // The player takes a fixed pixel size, so it's kept matched to the thumbnail it fills
  const [thumbnailRef, { width: thumbnailWidth, height: thumbnailHeight }] = useMeasure<HTMLDivElement>();
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
    <>
      <div className="flex flex-col items-stretch gap-3">
        <div className="flex min-w-0 flex-col gap-1 sm:gap-3">
          <span
            className="typography text-inactive text-xs leading-none tracking-wider uppercase"
            data-test="online-picker-label">
            {picked ? 'Picked by' : 'Picking now'}
          </span>
          <span
            className="typography text-active truncate text-xl leading-tight font-bold max-lg:text-lg"
            data-test="online-picker-name">
            {pickerName ?? 'Nobody yet'}
          </span>
          {invite && <div className="mt-2 sm:mt-4">{invite}</div>}
        </div>

        <div className="flex w-full flex-col gap-2">
          <div
            ref={thumbnailRef}
            className="relative isolate flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-[#2b2b2b]">
            {video ? (
              <VideoPlayer
                ref={player}
                video=""
                width={Math.round(thumbnailWidth)}
                height={Math.round(thumbnailHeight)}
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

          {/* Always rendered: with nothing picked it is the line that says so */}
          <div className="flex flex-col gap-1">
            <span
              className="typography text-active truncate text-lg leading-tight font-bold"
              data-test="online-host-browsing-title">
              {preview?.title ?? 'No song yet'}
            </span>
            <span className="typography text-md truncate leading-tight" data-test="online-host-browsing-artist">
              {preview?.artist ?? 'Waiting for a pick…'}
            </span>
            {preview && (
              <div className="mt-1 flex flex-wrap items-center gap-1" data-test="online-host-browsing-details">
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
      </div>

      <div className="mt-3 sm:mt-auto">{footer}</div>
    </>
  );
}

export default LobbySongCard;
