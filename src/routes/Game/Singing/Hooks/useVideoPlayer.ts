import { RefObject, useEffect, useState } from 'react';
import { milliseconds } from '~/interfaces';
import { VideoPlayerRef, VideoState } from '~/modules/Elements/VideoPlayer';
import { FPSCountSetting, InputLagSetting, useSettingValue } from '~/routes/Settings/SettingsState';

export const useVideoPlayer = (
  playerRef: RefObject<VideoPlayerRef | null>,
  onTimeUpdate?: (timeMs: milliseconds) => void,
) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(VideoState.UNSTARTED);
  const [inputLag] = useSettingValue(InputLagSetting);

  useEffect(() => {
    if (!playerRef.current) {
      return;
    }
    if (currentStatus === VideoState.PLAYING) {
      const interval = setInterval(async () => {
        if (!playerRef.current) return;

        const time = Math.max(0, (await playerRef.current.getCurrentTime()) * 1000 - inputLag);
        setCurrentTime(time);
        onTimeUpdate?.(time);
      }, 1000 / FPSCountSetting.get());

      return () => clearInterval(interval);
    }
  }, [playerRef, currentStatus, inputLag]);

  return [currentStatus, setCurrentStatus, currentTime] as const;
};
