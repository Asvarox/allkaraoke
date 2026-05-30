import { MutableRefObject, useEffect } from 'react';
import YouTube from 'react-youtube';

export default function usePlayerVolume(playerRef: MutableRefObject<YouTube | null>, volume: number | undefined) {
  useEffect(() => {
    playerRef.current?.getInternalPlayer()?.setVolume(Math.round((volume ?? 0.5) * 100));
  }, [playerRef, volume]);
}
