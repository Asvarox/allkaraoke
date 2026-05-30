import { ComponentProps } from 'react';

import DirectVideo from '~/modules/Elements/VideoPlayer/DirectVideo';
import Youtube, { VideoPlayerRef } from './Youtube';
// The videos need to be inlined, vite preview underlying dev server
// doesn't support video seeking requests breaking skip intro tests.
// See https://github.com/vitejs/vite/issues/10744
import dummyLongVideo from './dummy-video-long.webm?inline';
import dummyVideo from './dummy-video.webm?inline';

type Props = ComponentProps<typeof Youtube>;

export default function OfflineVideoPlayer({
  video,
  controls,
  ref,
  ...restProps
}: Props & { ref?: React.Ref<VideoPlayerRef> }) {
  const offlineVideo = video === 'Vueyx9TBEqE' ? dummyLongVideo : dummyVideo;

  return <DirectVideo ref={ref} video={offlineVideo} controls {...restProps} />;
}
