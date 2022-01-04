import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './Player.css';
import YouTube from 'react-youtube';
import GameOverlay from './GameOverlay';
import { Song } from '../../interfaces';

const dstyle = {
    position: 'absolute' as any,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, .2)',
    pointerEvents: 'none' as any,
};

interface Props {
    song: Song,
    width: number,
    height: number,
    autoplay?: boolean,
    showControls?: boolean,
    onTimeUpdate?: (newTime: number) => void,
}

export interface PlayerRef {
    // getCurrentTime: () => number,
    seekTo: (time: number) => void,
    setPlaybackSpeed: (speed: number) => void,
}

function Player({ song, width, height, autoplay = true, showControls = false, onTimeUpdate}: Props, ref: ForwardedRef<PlayerRef>) {
    const player = useRef<YouTube | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentStatus, setCurrentStatus] = useState(YouTube.PlayerState.UNSTARTED);

    useEffect(() => {
        if (!player.current) {
            return;
        }
        const interval = setInterval(async () => {
            const time = (await player.current!.getInternalPlayer().getCurrentTime()) * 1000;
            setCurrentTime(time);
            onTimeUpdate?.(time);
        }, 16);

        return () => clearInterval(interval);
    }, [player, onTimeUpdate, currentStatus]);

    useEffect(() => {
        if (!player.current) {
            return;
        }

        player.current.getInternalPlayer().setSize(width, height);
    }, [player, width, height])


    useImperativeHandle(ref, () => ({
        // getCurrentTime: () => currentTime,
        seekTo: (time: number) => player.current!.getInternalPlayer().seekTo(time, true),
        setPlaybackSpeed: (speed: number) => player.current!.getInternalPlayer().setPlaybackRate(speed),
    }))
    
    return (
        <div className="App">
            {currentStatus !== YouTube.PlayerState.UNSTARTED && (
                <div style={dstyle}>
                    <GameOverlay
                        currentStatus={currentStatus}
                        song={song}
                        currentTime={currentTime}
                        width={width}
                        height={height}
                    />
                </div>
            )}
            <YouTube
                ref={player}
                videoId={song.video}
                opts={{
                    // width: String(width),
                    // height: String(height),
                    playerVars: {
                        autoplay: autoplay ? 1 : 0,
                        showinfo: 0, 
                        rel: 0, 
                        fs: 0, 
                        controls: showControls ? 1 : 0, 
                        cc_load_policy: undefined, 
                        start: song.videoGap
                     },
                }}
                onStateChange={(e) => setCurrentStatus(e.data)}
            />
        </div>
    );
}

export default forwardRef(Player);