import { RefObject, useEffect, useRef, useState } from 'react';
import { milliseconds } from '~/interfaces';
import { VideoPlayerRef, VideoState } from '~/modules/elements/video-player/index';
import { FPSCountSetting, InputLagSetting, useSettingValue } from '~/routes/settings/settings-state';

export const useVideoPlayer = (
  playerRef: RefObject<VideoPlayerRef | null>,
  onTimeUpdate?: (timeMs: milliseconds) => void,
) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(VideoState.UNSTARTED);
  const [inputLag] = useSettingValue(InputLagSetting);

  // Keep the latest onTimeUpdate in a ref so the interval isn't torn down and recreated when the
  // caller passes a fresh callback each render.
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;

  useEffect(() => {
    if (!playerRef.current) {
      return;
    }
    if (currentStatus === VideoState.PLAYING) {
      const interval = setInterval(async () => {
        if (!playerRef.current) return;

        const time = Math.max(0, (await playerRef.current.getCurrentTime()) * 1000 - inputLag);
        setCurrentTime(time);
        onTimeUpdateRef.current?.(time);
      }, 1000 / FPSCountSetting.get());

      return () => clearInterval(interval);
    }
  }, [playerRef, currentStatus, inputLag]);

  return [currentStatus, setCurrentStatus, currentTime] as const;
};
