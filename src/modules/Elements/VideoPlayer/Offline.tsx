import { ComponentProps, ForwardedRef, forwardRef } from 'react';

import DirectVideo from 'modules/Elements/VideoPlayer/DirectVideo';
import Youtube, { VideoPlayerRef } from './Youtube';
import dummyLongVideo from './dummy-video-long.webm';
import dummyVideo from './dummy-video.webm';

type Props = ComponentProps<typeof Youtube>;

export default forwardRef(function OfflineVideoPlayer(
  { video, controls, ...restProps }: Props,
  ref: ForwardedRef<VideoPlayerRef>,
) {
  return (
    <DirectVideo ref={ref} video={video === 'Vueyx9TBEqE' ? dummyLongVideo : dummyVideo} controls {...restProps} />
  );
});
