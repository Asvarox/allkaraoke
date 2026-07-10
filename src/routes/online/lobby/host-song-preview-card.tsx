import VideoPlayer from '~/modules/elements/video-player/index';
import { SongHoverPreview } from '~/modules/online/protocol/types';

interface Props {
  preview: SongHoverPreview;
}

/** Song-card-like preview of the song the host is browsing (or has selected) — everyone
 * can watch/listen to the video and see the details. */
function HostSongPreviewCard({ preview }: Props) {
  return (
    <div className="flex flex-col gap-2 overflow-hidden rounded-xl bg-black/50 pb-3" data-test="online-host-browsing">
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden">
        {preview.video ? (
          <VideoPlayer
            key={preview.video}
            video={preview.video}
            width={480}
            height={270}
            autoplay
            volume={preview.volume}
            startAt={preview.previewStart ?? 0}
          />
        ) : (
          <div className="h-full w-full bg-black" />
        )}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/90 to-transparent p-3">
          <div className="typography text-lg" data-test="online-host-browsing-artist">
            {preview.artist}
          </div>
          <div className="typography text-active text-2xl" data-test="online-host-browsing-title">
            {preview.title}
          </div>
        </div>
      </div>
      <div
        className="typography flex flex-wrap gap-x-4 px-3 text-sm opacity-85"
        data-test="online-host-browsing-details">
        {preview.language?.length ? <span>🌐 {preview.language.join(', ')}</span> : null}
        {preview.year && <span>📅 {preview.year}</span>}
        <span>⚔️ {preview.mode ?? 'Duel'}</span>
        {preview.difficulty && <span>🎯 {preview.difficulty}</span>}
      </div>
    </div>
  );
}

export default HostSongPreviewCard;
