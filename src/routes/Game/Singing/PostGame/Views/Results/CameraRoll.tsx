import styled from '@emotion/styled';
import { captureException } from '@sentry/react';
import CameraManager from 'modules/Camera/CameraManager';
import Text from 'modules/Elements/AKUI/Primitives/Text';
import { useEffect, useRef, useState } from 'react';

function CameraRoll() {
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
    <div className={`flex flex-col`}>
      <Video src={videoSrc} ref={video} loop autoPlay className="ph-no-capture" />
      <Text className="mt-4 text-center">
        You can disable camera mode in <strong>Settings</strong>.
      </Text>
    </div>
  );
}

const Video = styled.video`
  object-fit: cover;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 1rem;
`;

export default CameraRoll;
