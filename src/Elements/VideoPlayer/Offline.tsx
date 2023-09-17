import { ComponentProps, ForwardedRef, forwardRef } from 'react';

import DirectVideo from 'Elements/VideoPlayer/DirectVideo';
import Youtube, { VideoPlayerRef } from './Youtube';
import dummyVideo from './dummy.mp4';

type Props = ComponentProps<typeof Youtube>;

export default forwardRef(function OfflineVideoPlayer(
  { video, controls, ...restProps }: Props,
  ref: ForwardedRef<VideoPlayerRef>,
) {
  return <DirectVideo ref={ref} video={dummyVideo} controls {...restProps} />;
});
