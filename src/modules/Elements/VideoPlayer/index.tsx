import isE2E from 'modules/utils/isE2E';
import { ComponentProps, ForwardedRef, forwardRef } from 'react';
import OfflineVideoPlayer from './Offline';
import YoutubeVideoPlayer, { VideoPlayerRef } from './Youtube';

const VideoPlayer = forwardRef(
  (props: ComponentProps<typeof YoutubeVideoPlayer>, ref: ForwardedRef<VideoPlayerRef>) => {
    if (import.meta.env.VITE_APP_OFFLINE || isE2E()) {
      return <OfflineVideoPlayer {...props} ref={ref} />;
    } else {
      return <YoutubeVideoPlayer {...props} ref={ref} />;
    }
  },
);

export default VideoPlayer;

export { VideoState } from './Youtube';
export type { VideoPlayerRef } from './Youtube';
