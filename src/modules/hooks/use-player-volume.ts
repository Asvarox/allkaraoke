import { MutableRefObject, useEffect, useState } from 'react';
import YouTube from 'react-youtube';

import { useMasterGain } from '~/modules/audio/master-volume';

const DEFAULT_VOLUME = 0.5;

/**
 * Keeps the YouTube player at `requested volume x master gain`. The requested volume is the `volume`
 * prop, unless `setRequestedVolume` (0-1) overrode it since - a new prop value wins again.
 */
export default function usePlayerVolume(playerRef: MutableRefObject<YouTube | null>, volume: number | undefined) {
  const masterGain = useMasterGain();
  const [override, setOverride] = useState<{ forProp: number | undefined; value: number } | null>(null);

  const requestedVolume = override && override.forProp === volume ? override.value : (volume ?? DEFAULT_VOLUME);

  useEffect(() => {
    playerRef.current?.getInternalPlayer()?.setVolume(Math.round(requestedVolume * masterGain * 100));
  }, [playerRef, requestedVolume, masterGain]);

  return {
    requestedVolume,
    setRequestedVolume: (value: number) => setOverride({ forProp: volume, value }),
  };
}
