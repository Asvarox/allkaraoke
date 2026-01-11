import { useEffect, useRef } from 'react';
import CameraManager from '~/modules/Camera/CameraManager';
import { Button } from '~/modules/Elements/AKUI/Button';
import Typography from '~/modules/Elements/AKUI/Primitives/Typography';
import { RegisterFunc } from '~/modules/hooks/useKeyboardNav';
import timelapse from './timelapse.webm';

interface Props {
  register: RegisterFunc;
  onConfirm: () => void;
  loading: boolean;
}

export const CameraRollPlaceholder = ({ register, onConfirm, loading }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const permissionStatus = CameraManager.getPermissionStatus();

  useEffect(() => {
    if (!loading && permissionStatus) {
      CameraManager.getLiveCameraFeed().then((stream) => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }
      });
    }
  }, [loading]);

  return (
    <div className={`relative flex aspect-4/3 justify-center ${!permissionStatus ? `items-center` : `items-end`}`}>
      <div className="rounded-2xl bg-black">
        <video
          autoPlay
          loop
          src={timelapse}
          className={`rounded-2xl ${!permissionStatus && 'opacity-25'}`}
          ref={videoRef}
        />
      </div>
      <div className="absolute flex flex-col gap-4 p-4">
        {!permissionStatus ? (
          <>
            <h2>
              Get a <strong>timelapse</strong> of you singing
            </h2>
            <Button
              className="animate-focused w-full p-4"
              {...register('enable-camera', onConfirm, undefined, false, { disabled: loading })}>
              Enable camera
            </Button>
            <Typography className="text-sm">The recording is not sent nor stored anywhere.</Typography>
          </>
        ) : (
          <h3>Adjust the camera position</h3>
        )}
      </div>
      {!permissionStatus && (
        <Typography className="absolute right-0 bottom-0 p-4 text-sm">
          Placeholder video from{' '}
          <a href="https://www.storyblocks.com/" target="_blank" rel="noreferrer">
            Storyblocks.com
          </a>
        </Typography>
      )}
    </div>
  );
};
