import { VideoState } from 'Elements/VideoPlayer';
import { Song } from 'interfaces';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import GameState from '../GameState/GameState';
import DurationBar from './Components/DurationBar';
import Lyrics from './Components/Lyrics';
import ScoreText from './Components/ScoreText';
import CanvasDrawing from './Drawing';

interface Props {
    song: Song;
    currentTime: number;
    currentStatus: VideoState;
    width: number;
    height: number;
    onSongEnd?: () => void;
    tracksForPlayers: [number, number];
    duration: number;
    effectsEnabled: boolean;
    playerChanges: number[][];
}

function GameOverlay({
    currentTime,
    currentStatus,
    width,
    height,
    tracksForPlayers,
    onSongEnd,
    playerChanges,
    effectsEnabled,
}: Props) {
    const canvas = useRef<HTMLCanvasElement | null>(null);
    const drawer = useRef<CanvasDrawing | null>(null);

    useEffect(() => {
        GameState.startInputMonitoring();

        return () => {
            GameState.stopInputMonitoring();
        };
    }, []);

    useEffect(() => {
        if (!canvas.current) return;

        drawer.current = new CanvasDrawing(canvas.current);
        drawer.current.start();

        return () => {
            drawer.current?.end();
        };
    }, [canvas]);

    useEffect(() => {
        if (currentStatus === VideoState.ENDED && onSongEnd) {
            onSongEnd();
        }
    }, [currentStatus, onSongEnd]);

    const overlayHeight = height - 2 * 100 - 80;
    return (
        <Screen>
            <DurationBar usedTracks={tracksForPlayers} />
            <Lyrics player={0} playerChanges={playerChanges} effectsEnabled={effectsEnabled} />
            <Scores>
                <span>
                    <ScoreText score={GameState.getPlayer(0).getScore()} />
                </span>
                <span>
                    <ScoreText score={GameState.getPlayer(1).getScore()} />
                </span>
                <GameCanvas>
                    <canvas ref={canvas} width={width} height={overlayHeight} />
                </GameCanvas>
            </Scores>
            <Lyrics player={1} playerChanges={playerChanges} bottom effectsEnabled={effectsEnabled} />
        </Screen>
    );
}

const Screen = styled.div`
    height: 100%;
    color: white;
    -webkit-text-stroke: 2px black;
    font-weight: bold;
    position: relative;
    display: flex;
    flex-direction: column;
`;

const GameCanvas = styled.div`
    position: absolute;
`;

const Scores = styled.div`
    flex: 1;
    height: 100%;
    box-sizing: border-box;
    font-size: 35px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    text-align: right;
`;

export default GameOverlay;
