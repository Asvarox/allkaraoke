import { useEffect, useMemo, useRef } from 'react';
import drawFrame from './Drawing';
import DummyInput from './Input/DummyInput';

import { FrequencyRecord, PlayerNote, Song } from '../../../interfaces';
import isNotesSection from './Helpers/isNotesSection';
import getSongBeatLength from './Helpers/getSongBeatLength';
import frequenciesToLines from './Helpers/frequenciesToPlayerNotes';
import styled from 'styled-components';
import MicInput from './Input/MicInput';
import calculateScore from './Helpers/calculateScore';
import YouTube from 'react-youtube';
import ScoreText from './ScoreText';
import InputInterface from './Input/Interface';
import DurationBar from './Components/DurationBar';
import useCurrentSectionIndex from './Hooks/useCurrentSectionIndex';
import getCurrentBeat from './Helpers/getCurrentBeat';
import Lyrics from './Components/Lyrics';

const Input = DummyInput;
// const Input = MicInput;

interface Props {
    song: Song;
    currentTime: number;
    currentStatus: number;
    width: number;
    height: number;
    onSongEnd?: (playerNotes: [PlayerNote[], PlayerNote[]]) => void;
    tracksForPlayers: [number, number],
    duration: number,
    playerChanges: number[][],
}

interface UsePlayerArgs {
    song: Song, songBeatLength: number, track: number, currentBeat: number, currentTime: number, canvas: HTMLCanvasElement | null,
    playerNumber: number, input: InputInterface,
}

const usePlayer = (params: UsePlayerArgs) => {
    const sections = params.song.tracks[params.track].sections;
    const wholeBeat = Math.floor(params.currentBeat);

    const [minPitch, maxPitch] = useMemo(() => {
        let min: number = Infinity;
        let max: number = -Infinity;

        sections.filter(isNotesSection).forEach((section) =>
            section.notes.forEach((note) => {
                min = Math.min(min, note.pitch);
                max = Math.max(max, note.pitch);
            }),
        );

        return [min, max];
    }, [sections]);

    const currentSectionIndex = useCurrentSectionIndex(sections, wholeBeat)

    const currentSection = sections?.[currentSectionIndex];
    const nextSection = sections?.[currentSectionIndex + 1];

    const allFrequencies = useRef<FrequencyRecord[]>([]);
    const historicFrequencies = useRef<FrequencyRecord[]>([]);
    const historicPlayerNotes = useRef<PlayerNote[]>([]);
    const playerNotes = useRef<PlayerNote[]>([]);

    useEffect(() => {
        // console.log(song.tracks[0].sections[currentSectionIndex]);
        allFrequencies.current = [...allFrequencies.current, ...historicFrequencies.current];
        historicFrequencies.current = [];
        historicPlayerNotes.current = [...historicPlayerNotes.current, ...playerNotes.current];
        playerNotes.current = [];
    }, [currentSectionIndex]);

    useEffect(() => {
        if (!params.canvas) return;

        if (params.currentTime >= params.song.gap && isNotesSection(currentSection)) {
            const frequencies = params.input.getFrequencies();

            historicFrequencies.current.push({
                timestamp: params.currentTime - params.input.getInputLag(),
                frequency: frequencies[params.playerNumber]
            });

            playerNotes.current = frequenciesToLines(
                historicFrequencies.current,
                params.songBeatLength,
                params.song.gap,
                currentSection.notes,
            );
        }

        drawFrame(
            params.playerNumber,
            params.song,
            params.track,
            params.songBeatLength,
            minPitch,
            maxPitch,
            params.canvas,
            params.currentTime,
            currentSectionIndex,
            historicFrequencies.current,
            playerNotes.current,
        );
    }, [
        params.input, params.playerNumber, params.canvas, currentSectionIndex, params.currentTime,
        minPitch, maxPitch, params.songBeatLength, params.song, currentSection, params.track,
    ]);

    return {
        currentSection,
        nextSection,
        playerNotes: playerNotes.current,
        historicPlayerNotes: historicPlayerNotes.current,
    }
}

function GameOverlay({ song, currentTime, currentStatus, width, height, tracksForPlayers, onSongEnd, duration, playerChanges }: Props) {
    const canvas = useRef<HTMLCanvasElement | null>(null);

    const songBeatLength = getSongBeatLength(song);
    const currentBeat = getCurrentBeat(currentTime, songBeatLength, song.gap, false);

    useEffect(() => {
        Input.startMonitoring();

        return () => {
            Input.stopMonitoring();
        };
    }, []);

    useEffect(() => {
        const ctx = canvas.current?.getContext('2d');
        if (!ctx || !canvas.current) return;

        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    }, [currentTime])

    const player1 = usePlayer({
        canvas: canvas.current, song, songBeatLength, currentBeat, currentTime, playerNumber: 0, track: tracksForPlayers[0], input: Input
    });

    // const player2 = player1;
    const player2 = usePlayer({
        canvas: canvas.current, song, songBeatLength, currentBeat, currentTime, playerNumber: 1, track: tracksForPlayers[1], input: Input
    });

    useEffect(() => {
        if (currentStatus === YouTube.PlayerState.ENDED && onSongEnd) {
            onSongEnd([
                [...player1.historicPlayerNotes, ...player1.playerNotes],
                [...player2.historicPlayerNotes, ...player2.playerNotes],
            ]);
        }
    }, [currentStatus, player1.historicPlayerNotes, player2.historicPlayerNotes, player1.playerNotes, player2.playerNotes, onSongEnd]);
    
    const overlayHeight = height - 2 * 100 - 40;
    return (
        <Screen>
            <DurationBar currentTime={currentTime} song={song} duration={duration} beatLength={songBeatLength} usedTracks={tracksForPlayers} />
            <Scores height={overlayHeight}>
                <span><ScoreText score={calculateScore([...player1.historicPlayerNotes, ...player1.playerNotes], song, tracksForPlayers[0])} /></span>
                <span><ScoreText score={calculateScore([...player2.historicPlayerNotes, ...player2.playerNotes], song, tracksForPlayers[1])} /></span>
            </Scores>
            <Lyrics
                currentBeat={currentBeat}
                beatLength={songBeatLength}
                section={player1.currentSection}
                nextSection={player1.nextSection} playerChanges={playerChanges[tracksForPlayers[0]]}
                bottom={false} gap={song.gap}
            />
            <canvas ref={canvas} width={width} height={overlayHeight} />
            <Lyrics
                currentBeat={currentBeat}
                beatLength={songBeatLength}
                section={player2.currentSection}
                nextSection={player2.nextSection} playerChanges={playerChanges[tracksForPlayers[1]]}
                bottom={true} gap={song.gap}
            />
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
        height: `${height}px`
    }
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
