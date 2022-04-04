import { MutableRefObject, useEffect, useState } from 'react';
import YouTube from 'react-youtube';

/**
 * For some reason YouTube player would start the song but not change the player state, making the game not
 * start.
 *
 * This Hooks "detects" that and return the key prop value for <YouTube /> component - if it's UNSTARTED
 * for more than a timeout, a new key will be generated to reload the entire player (and try again).
 */
function useUnstuckOnStartSong(currentStatus: number) {
    const [playerKey, setPlayerKey] = useState(0);
    useEffect(() => {
        if (currentStatus === YouTube.PlayerState.UNSTARTED) {
            const timeout = setTimeout(() => {
                setPlayerKey((current) => current + 1);
            }, 2500);

            return () => {
                clearTimeout(timeout);
            };
        }
    });

    return playerKey;
}

/**
 * For some reason once YouTube player enters BUFFERING state, it gets stuck even when internet is
 * back available. Seeking to some timestamp unstucks it.
 *
 * "Fix": If player enters BUFFERING status, wait until internet is available, then go back a couple
 * of seconds of the song to force the player to start playing
 */
function useUnstuckOnBuffering(playerRef: MutableRefObject<YouTube | null>, currentStatus: number) {
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

export default function useUnstuckYouTubePlayer(playerRef: MutableRefObject<YouTube | null>, currentStatus: number) {
    useUnstuckOnBuffering(playerRef, currentStatus);

    return useUnstuckOnStartSong(currentStatus);
}
