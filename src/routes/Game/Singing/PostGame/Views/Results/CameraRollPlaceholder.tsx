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
    <div className={`typography flex aspect-4/3 flex-col items-end`}>
      <div className="relative rounded-2xl bg-black">
        <video
          autoPlay
          loop
          src={timelapse}
          className={`rounded-2xl ${!permissionStatus && 'opacity-25'}`}
          ref={videoRef}
        />
        <div className="absolute right-0 bottom-0 left-0 flex h-full flex-col items-center justify-center gap-4 p-2 sm:gap-2">
          {!permissionStatus ? (
            <>
              <span className="text-md sm:text-sm lg:text-lg">
                Get a <strong>timelapse</strong> of you singing
              </span>
              <Button
                subtleFocused
                className="w-full p-4"
                {...register('enable-camera', onConfirm, undefined, false, { disabled: loading })}>
                Enable camera
              </Button>
              <Typography className="text-sm sm:text-xs lg:text-sm">
                The recording is not sent nor stored anywhere.
              </Typography>
            </>
          ) : (
            <span className="text-md md:text-md sm:text-sm lg:text-lg 2xl:text-xl">Adjust the camera position</span>
          )}
        </div>
      </div>
      {!permissionStatus && (
        <Typography className="text-sm sm:text-xs md:text-sm">
          Placeholder video from{' '}
          <a href="https://www.storyblocks.com/" target="_blank" rel="noreferrer">
            Storyblocks
          </a>
        </Typography>
      )}
    </div>
  );
};
