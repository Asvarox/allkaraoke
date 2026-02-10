import { captureException } from '@sentry/react';
import { useEffect, useRef, useState } from 'react';
import CameraManager from '~/modules/Camera/CameraManager';
import Typography from '~/modules/Elements/AKUI/Primitives/Typography';

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
    <div className="flex flex-col">
      <video
        src={videoSrc}
        ref={video}
        loop
        autoPlay
        className="ph-no-capture aspect-4/3 w-full rounded-2xl bg-black object-cover"
      />
      <Typography className="2xl:text-md text-center text-xs lg:text-sm">
        You can disable camera mode in <strong>Settings</strong>.
      </Typography>
    </div>
  );
}

export default CameraRoll;
