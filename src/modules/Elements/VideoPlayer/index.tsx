import { ComponentProps, ForwardedRef } from 'react';
import isE2E from '~/modules/utils/isE2E';
import OfflineVideoPlayer from './Offline';
import YoutubeVideoPlayer, { VideoPlayerRef } from './Youtube';

const VideoPlayer = (props: ComponentProps<typeof YoutubeVideoPlayer> & { ref?: ForwardedRef<VideoPlayerRef> }) => {
  if (import.meta.env.VITE_APP_OFFLINE || isE2E()) {
    return <OfflineVideoPlayer {...props} />;
  } else {
    return <YoutubeVideoPlayer {...props} />;
  }
};

export default VideoPlayer;

export { VideoState } from '~/modules/Elements/VideoPlayer/VideoState';
export type { VideoPlayerRef } from './Youtube';
