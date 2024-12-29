import styled from '@emotion/styled';
import { captureException } from '@sentry/react';
import CameraManager from 'modules/Camera/CameraManager';
import { ComponentProps, useEffect, useRef, useState } from 'react';

function CameraRoll({ ...props }: ComponentProps<typeof Container>) {
  const [videoSrc, setVideoSrc] = useState('');
  const video = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Seems it needs some time to process the video, otherwise invalid URL is returned
    const timeout = setTimeout(() => {
      setVideoSrc(CameraManager.getVideo());
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    try {
      if (video.current) video.current.playbackRate = 16;
    } catch (e) {
      captureException(e);
    }
  }, [videoSrc]);

  return (
    <Container {...props}>
      <Video src={videoSrc} ref={video} loop autoPlay className="ph-no-capture" />
    </Container>
  );
}

const Container = styled.div`
  width: 35%;
`;

const Video = styled.video`
  object-fit: cover;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 1rem;
`;

export default CameraRoll;
