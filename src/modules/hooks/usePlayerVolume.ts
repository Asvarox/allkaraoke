import { useEffect } from 'react';
import YouTube from 'react-youtube';

export default function usePlayerVolume(playerRef: YouTube | null, volume: number | undefined) {
  useEffect(() => {
    playerRef?.getInternalPlayer()?.setVolume(Math.round((volume ?? 0.5) * 100));
  }, [playerRef, volume]);
}
