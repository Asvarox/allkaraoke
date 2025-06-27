import Typography from 'modules/Elements/AKUI/Primitives/Typography';
import VideoPlayer, { VideoPlayerRef, VideoState } from 'modules/Elements/VideoPlayer';
import { useEffect, useRef, useState } from 'react';
import { useMeasure } from 'react-use';

import { useVideoPlayer } from 'routes/Game/Singing/Hooks/useVideoPlayer';

export const CalibrationTool = () => {
  const [playerContainer, { width }] = useMeasure<HTMLDivElement>();
  const playerRef = useRef<VideoPlayerRef>(null);
  const [currentStatus, setCurrentStatus, currentTime] = useVideoPlayer(playerRef);
  const [nextPulse, setNextPulse] = useState(250);

  useEffect(() => {
    if (nextPulse < currentTime) {
      setNextPulse(nextPulse + 250);
    }
  }, [nextPulse, currentTime]);

  useEffect(() => {
    if (currentStatus === VideoState.PLAYING) {
      playerRef.current?.setPlaybackSpeed(0.25);
    }
  }, [currentStatus]);

  return (
    <div className="flex flex-col items-center justify-center" ref={playerContainer}>
      {currentStatus === VideoState.PLAYING ? (
        <div
          className="animate-calibrate-pulse bg-active pointer-events-none absolute h-[150px] w-[150px] rounded-full"
          key={nextPulse}
        />
      ) : (
        <Typography className="pointer-events-none absolute text-center">
          <strong>Click here</strong> to start calibration
        </Typography>
      )}
      <div className="opacity-0">
        <VideoPlayer
          autoplay
          ref={playerRef}
          video="ivNFSVAYVZU"
          width={width}
          height={150}
          onStateChange={setCurrentStatus}
        />
      </div>
    </div>
  );
};
