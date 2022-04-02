import { MutableRefObject, useEffect } from 'react';
import YouTube from 'react-youtube';

/**
 * For some reason once YouTube player enters BUFFERING state, it gets stuck even when internet is
 * back available. Seeking to some timestamp unstucks it.
 *
 * "Fix": If player enters BUFFERING status, wait until internet is available, then go back a couple
 * of seconds of the song to force the player to start playing
 */
export default function useUnstuckYouTubePlayer(playerRef: MutableRefObject<YouTube | null>, currentStatus: number) {
    useEffect(() => {
        if (currentStatus === YouTube.PlayerState.BUFFERING) {
            const interval = setInterval(async () => {
                if (navigator.onLine) {
                    clearInterval(interval);

                    const seconds = await playerRef.current?.getInternalPlayer().getCurrentTime();
                    playerRef.current?.getInternalPlayer().seekTo(Math.max(seconds - 2, 0));
                }
            }, 500);

            return () => {
                clearInterval(interval);
            };
        }
    });
}
