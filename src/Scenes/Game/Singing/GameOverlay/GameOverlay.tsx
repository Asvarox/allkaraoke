import styled from '@emotion/styled';
import { VideoPlayerRef, VideoState } from 'Elements/VideoPlayer';
import { PlayerSetup, Song } from 'interfaces';
import { useEffect, useRef } from 'react';
import SkipIntro from 'Scenes/Game/Singing/GameOverlay/Components/SkipIntro';
import SkipOutro from 'Scenes/Game/Singing/GameOverlay/Components/SkipOutro';
import GameState from '../GameState/GameState';
import DurationBar from './Components/DurationBar';
import Lyrics from './Components/Lyrics';
import ScoreText from './Components/ScoreText';
import CanvasDrawing from './Drawing';
import Camera from 'Scenes/Game/Singing/GameOverlay/Components/Camera';

interface Props {
    song: Song;
    currentStatus: VideoState;
    width: number;
    height: number;
    onSongEnd: () => void;
    players: [PlayerSetup, PlayerSetup];
    duration: number;
    effectsEnabled: boolean;
    playerChanges: number[][];
    videoPlayerRef: VideoPlayerRef | null;
    isPauseMenuVisible: boolean;
}

const MAX_RENDER_RESOLUTION_W = 1920;

function GameOverlay({
    currentStatus,
    width,
    height,
    players,
    onSongEnd,
    playerChanges,
    effectsEnabled,
    videoPlayerRef,
    isPauseMenuVisible,
}: Props) {
    const canvas = useRef<HTMLCanvasElement | null>(null);
    const drawer = useRef<CanvasDrawing | null>(null);
    const lyrics = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        GameState.startInputMonitoring();

        return () => {
            GameState.stopInputMonitoring();
        };
    }, []);

    const overlayWidth = MAX_RENDER_RESOLUTION_W;
    const overlayHeight = overlayWidth * (height / width);

    const overlayScaleFactor = overlayHeight / height;
    const resolutionScaleFactor = overlayWidth / MAX_RENDER_RESOLUTION_W;

    useEffect(() => {
        if (!canvas.current || !lyrics.current) return;

        drawer.current = new CanvasDrawing(
            canvas.current,
            lyrics.current.offsetHeight * overlayScaleFactor,
            resolutionScaleFactor,
        );
        drawer.current.start();

        return () => {
            drawer.current?.end();
        };
    }, [canvas.current, lyrics.current?.offsetHeight, overlayScaleFactor]);

    useEffect(() => {
        if (currentStatus === VideoState.ENDED && onSongEnd) {
            onSongEnd();
        }
    }, [currentStatus, onSongEnd]);

    return (
        <Screen>
            <Camera />
            <GameCanvas>
                <canvas ref={canvas} width={overlayWidth} height={overlayHeight} />
            </GameCanvas>
            {effectsEnabled && (
                <>
                    <SkipIntro playerRef={videoPlayerRef} isEnabled={!isPauseMenuVisible} />
                    <SkipOutro onSongEnd={onSongEnd} isEnabled={!isPauseMenuVisible} />
                </>
            )}
            <DurationBar players={players} />
            <div ref={lyrics}>
                <Lyrics player={0} playerChanges={playerChanges} effectsEnabled={effectsEnabled} />
            </div>
            <Scores>
                {effectsEnabled && (
                    <>
                        <span data-test="player-1-score" data-score={GameState.getPlayer(0).getScore()}>
                            <ScoreText score={GameState.getPlayer(0).getScore()} />
                        </span>
                        <span data-test="player-2-score" data-score={GameState.getPlayer(1).getScore()}>
                            <ScoreText score={GameState.getPlayer(1).getScore()} />
                        </span>
                    </>
                )}
            </Scores>
            <Lyrics player={1} playerChanges={playerChanges} bottom effectsEnabled={effectsEnabled} />
        </Screen>
    );
}

export default GameOverlay;

const Screen = styled.div`
    height: 100%;
    color: white;
    -webkit-text-stroke: thick black;
    font-weight: bold;
    position: relative;
    display: flex;
    flex-direction: column;
`;

const GameCanvas = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    canvas {
        width: 100%;
        height: 100%;
    }
`;

const Scores = styled.div`
    flex: 1;
    height: 100%;
    box-sizing: border-box;
    font-size: 5.5rem;
    display: flex;
    justify-content: center;
    gap: 4rem;
    padding-right: 4rem;
    flex-direction: column;
    text-align: right;
`;
