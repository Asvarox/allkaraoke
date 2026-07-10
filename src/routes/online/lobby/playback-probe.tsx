import { useRef } from 'react';
import { Song } from '~/interfaces';
import VideoPlayer, { VideoPlayerRef, VideoState } from '~/modules/elements/video-player/index';
import OnlineClient from '~/modules/online/client/online-client';

interface Props {
  song: Song;
}

/** Hidden player that tries to start the room's video (muted) and reports playability to the
 * room server. The server only starts the countdown once every connected singer is playable. */
function PlaybackProbe({ song }: Props) {
  const reported = useRef(false);
  const player = useRef<VideoPlayerRef | null>(null);

  const report = (playable: boolean) => {
    if (reported.current) return;
    reported.current = true;
    void OnlineClient.rpc.room.reportProbe(playable).catch(console.warn);
  };

  return (
    <div className="pointer-events-none fixed h-px w-px overflow-hidden opacity-0" data-test="online-playback-probe">
      <VideoPlayer
        ref={player}
        video={song.video}
        width={320}
        height={180}
        autoplay
        volume={0}
        startAt={song.videoGap ?? 0}
        onStateChange={(state) => {
          if (state === VideoState.PLAYING || state === VideoState.CUED) {
            report(true);
            player.current?.pauseVideo();
          }
        }}
      />
    </div>
  );
}

export default PlaybackProbe;
