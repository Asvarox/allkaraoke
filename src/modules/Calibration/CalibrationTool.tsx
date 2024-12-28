import Text from 'modules/Elements/AKUI/Primitives/Text';
import VideoPlayer, { VideoPlayerRef, VideoState } from 'modules/Elements/VideoPlayer';
import { useEffect, useRef, useState } from 'react';
import { useMeasure } from 'react-use';
import { useVideoPlayer } from 'routes/Game/Singing/Player';

export const CalibrationTool = () => {
  const [playerContainer, { width }] = useMeasure<HTMLDivElement>();
  const playerRef = useRef<VideoPlayerRef>(null);
  const [currentStatus, setCurrentStatus, currentTime] = useVideoPlayer(playerRef);
  const [nextPulse, setNextPulse] = useState(1_000);

  useEffect(() => {
    if (nextPulse < currentTime) {
      setNextPulse(nextPulse + 1_000);
    }
  }, [nextPulse, currentTime]);

  return (
    <div className="flex flex-col items-center justify-center" ref={playerContainer}>
      {currentStatus === VideoState.PLAYING ? (
        <div
          className="w-[150px] h-[150px] rounded-full bg-active animate-calibrationPulse scale-0 absolute pointer-events-none"
          key={nextPulse}
        />
      ) : (
        <Text className="pointer-events-none absolute text-center">
          <strong>Click here</strong> to start calibration
        </Text>
      )}
      <div className="opacity-0">
        <VideoPlayer
          autoplay
          ref={playerRef}
          video="gSmf7W3DUjs"
          width={width}
          height={150}
          onStateChange={setCurrentStatus}
        />
      </div>
    </div>
  );
};
