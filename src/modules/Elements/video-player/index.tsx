import { ComponentProps, ForwardedRef } from 'react';
import isE2E from '~/modules/utils/is-e2-e';
import OfflineVideoPlayer from './offline';
import YoutubeVideoPlayer, { VideoPlayerRef } from './youtube';

const VideoPlayer = (props: ComponentProps<typeof YoutubeVideoPlayer> & { ref?: ForwardedRef<VideoPlayerRef> }) => {
  if (import.meta.env.VITE_APP_OFFLINE || isE2E()) {
    return <OfflineVideoPlayer {...props} />;
  } else {
    return <YoutubeVideoPlayer {...props} />;
  }
};

export default VideoPlayer;

export { VideoState } from '~/modules/elements/video-player/video-state';
export type { VideoPlayerRef } from './youtube';
