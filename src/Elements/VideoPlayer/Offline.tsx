import { ComponentProps, ForwardedRef, forwardRef } from 'react';

import DirectVideo from 'Elements/VideoPlayer/DirectVideo';
import dummyVideo from './dummy.mp4';
import Youtube, { VideoPlayerRef } from './Youtube';

type Props = ComponentProps<typeof Youtube>;

export default forwardRef(function OfflineVideoPlayer(
    { video, controls, ...restProps }: Props,
    ref: ForwardedRef<VideoPlayerRef>,
) {
    return <DirectVideo ref={ref} video={dummyVideo} controls {...restProps} />;
});
