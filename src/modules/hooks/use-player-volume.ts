import { MutableRefObject, useEffect } from 'react';
import YouTube from 'react-youtube';

import { useMasterGain } from '~/modules/audio/master-volume';

export default function usePlayerVolume(playerRef: MutableRefObject<YouTube | null>, volume: number | undefined) {
  const masterGain = useMasterGain();

  useEffect(() => {
    playerRef.current?.getInternalPlayer()?.setVolume(Math.round((volume ?? 0.5) * masterGain * 100));
  }, [playerRef, volume, masterGain]);
}
