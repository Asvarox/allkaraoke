import { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import styled from 'styled-components';
import { Song } from '../../../interfaces';
import DurationBar from './Components/DurationBar';
import Lyrics from './Components/Lyrics';
import CanvasDrawing from './Drawing';
import GameState from './GameState/GameState';
import ScoreText from './ScoreText';

interface Props {
    song: Song;
    currentTime: number;
    currentStatus: number;
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
    }, [canvas]);

    useEffect(() => {
        if (!drawer.current) return;

        drawer.current.drawFrame();
    }, [currentTime]);

    useEffect(() => {
        if (currentStatus === YouTube.PlayerState.ENDED && onSongEnd) {
            onSongEnd();
            drawer.current?.end();
        }
    }, [currentStatus, onSongEnd]);

    const overlayHeight = height - 2 * 100 - 40;
    return (
        <Screen>
            <DurationBar usedTracks={tracksForPlayers} />
            <Scores height={overlayHeight}>
                <span>
                    <ScoreText score={GameState.getPlayer(0).getScore()} />
                </span>
                <span>
                    <ScoreText score={GameState.getPlayer(1).getScore()} />
                </span>
            </Scores>
            <Lyrics player={0} playerChanges={playerChanges} effectsEnabled={effectsEnabled} />
            <canvas ref={canvas} width={width} height={overlayHeight} />
            <Lyrics player={1} playerChanges={playerChanges} bottom effectsEnabled={effectsEnabled} />
        </Screen>
    );
}

const Screen = styled.div`
    padding: 20px 0;
    color: white;
    -webkit-text-stroke: 2px black;
    font-weight: bold;
`;

const Scores = styled.div.attrs<{ height: number }>(({ height }) => ({
    style: {
        height: `${height}px`,
    },
}))<{ height: number }>`
    margin-top: 100px;
    position: absolute;
    right: 10px;
    font-size: 35px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    text-align: right;
`;

export default GameOverlay;
