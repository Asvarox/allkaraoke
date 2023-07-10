import 'core-js/es/array/at';
import { ComponentProps, ForwardedRef, forwardRef } from 'react';
import OfflineVideoPlayer from './Offline';
import YoutubeVideoPlayer, { VideoPlayerRef } from './Youtube';

const VideoPlayer = forwardRef(
    (props: ComponentProps<typeof YoutubeVideoPlayer>, ref: ForwardedRef<VideoPlayerRef>) => {
        if (import.meta.env.VITE_REACT_APP_OFFLINE) {
            return <OfflineVideoPlayer {...props} ref={ref} />;
        } else {
            return <YoutubeVideoPlayer {...props} ref={ref} />;
        }
    },
);

export default VideoPlayer;

export { VideoState } from './Youtube';
export type { VideoPlayerRef } from './Youtube';
