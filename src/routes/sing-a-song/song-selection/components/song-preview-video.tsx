import VideoPlayer from '~/modules/elements/video-player/index';
import { SongPreviewVideoState } from '~/routes/sing-a-song/song-selection/components/use-song-preview-video';

/** The preview's player, revealed once its video is playing */
export default function SongPreviewVideo({
  video,
}: {
  video: Pick<SongPreviewVideoState, 'player' | 'showVideo' | 'volume' | 'onStateChange'>;
}) {
  return (
    <div className={video.showVideo ? 'opacity-100 transition-opacity duration-500' : 'opacity-0'}>
      <VideoPlayer
        width={0}
        height={0}
        disablekb
        ref={video.player}
        video={''}
        volume={video.volume}
        onStateChange={video.onStateChange}
      />
    </div>
  );
}
