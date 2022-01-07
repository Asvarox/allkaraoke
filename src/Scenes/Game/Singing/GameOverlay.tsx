import { useEffect, useMemo, useRef } from 'react';
import drawFrame from './Drawing';
import DummyInput from './Input/DummyInput';

import { FrequencyRecord, PlayerNote, Song } from '../../../interfaces';
import styles from './Drawing/styles';
import isNotesSection from './Helpers/isNotesSection';
import getSongBeatLength from './Helpers/getSongBeatLength';
import frequenciesToLines from './Helpers/frequenciesToPlayerNotes';
import styled from 'styled-components';
import MicInput from './Input/MicInput';
import calculateScore from './Helpers/calculateScore';
import YouTube from 'react-youtube';
import ScoreText from './ScoreText';

const Input = DummyInput;
// const Input = MicInput;

interface Props {
    song: Song;
    currentTime: number;
    currentStatus: number;
    width: number;
    height: number;
    onSongEnd?: (playerNotes: [PlayerNote[], PlayerNote[]]) => void;
}

function GameOverlay({ song, currentTime, currentStatus, width, height, onSongEnd }: Props) {
    const canvas = useRef<HTMLCanvasElement | null>(null);

    const songBeatLength = useMemo(() => getSongBeatLength(song), [song]);
    const currentBeat = Math.floor((currentTime - song.gap) / songBeatLength);

    useEffect(() => {
        Input.startMonitoring();

        return () => {
            Input.stopMonitoring();
        };
    }, []);

    const [minPitch, maxPitch] = useMemo(() => {
        let min: number = Infinity;
        let max: number = -Infinity;

        song.tracks[0].sections.filter(isNotesSection).forEach((section) =>
            section.notes.forEach((note) => {
                min = Math.min(min, note.pitch);
                max = Math.max(max, note.pitch);
            }),
        );

        return [min, max];
    }, [song]);

    const currentSectionIndex = useMemo(
        () =>
            song.tracks[0].sections.findIndex((section, index, sections) => {
                if (currentBeat < 0) return true;
                if (currentBeat < section.start) return false;
                if (index === sections.length - 1) return true;
                if (sections[index + 1].start > currentBeat) {
                    return true;
                }
                return false;
            }),
        [currentBeat, song],
    );

    const currentSection = song.tracks[0].sections?.[currentSectionIndex];
    const nextSection = song.tracks[0].sections?.[currentSectionIndex + 1];

    const currentNote = useMemo(() => {
        if (!isNotesSection(currentSection) || currentBeat < 0) return null;
        const index = currentSection.notes.findIndex(
            (note) => currentBeat >= note.start && currentBeat < note.start + note.length,
        );

        return index > -1 ? index : null;
    }, [currentBeat, currentSection]);

    const historicFrequencies = useRef<[FrequencyRecord[], FrequencyRecord[]]>([[], []]);
    const playerNotes = useRef<[PlayerNote[], PlayerNote[]]>([[], []]);
    const historicPlayerNotes = useRef<[PlayerNote[], PlayerNote[]]>([[], []]);

    useEffect(() => {
        historicFrequencies.current[0] = [];
        historicFrequencies.current[1] = [];

        historicPlayerNotes.current[0] = [...historicPlayerNotes.current[0], ...playerNotes.current[0]];
        historicPlayerNotes.current[1] = [...historicPlayerNotes.current[1], ...playerNotes.current[1]];

        playerNotes.current[0] = [];
        playerNotes.current[1] = [];
    }, [currentSectionIndex]);

    useEffect(() => {
        if (!canvas.current) return;

        if (currentTime >= song.gap && isNotesSection(currentSection)) {
            const [frequency1, frequency2] = Input.getFrequencies();

            historicFrequencies.current[0].push({ timestamp: currentTime, frequency: frequency1 });
            historicFrequencies.current[1].push({ timestamp: currentTime, frequency: frequency2 });

            playerNotes.current[0] = frequenciesToLines(
                historicFrequencies.current[0],
                songBeatLength,
                song.gap,
                currentSection.notes,
            );
            // playerNotes.current[1] = frequenciesToLines(
            //     historicFrequencies.current[1],
            //     songBeatLength,
            //     song.gap,
            //     currentSection.notes,
            // );
        }

        drawFrame(
            song,
            songBeatLength,
            minPitch,
            maxPitch,
            canvas.current!,
            currentTime,
            currentSectionIndex,
            historicFrequencies.current,
            playerNotes.current,
        );
    }, [canvas, currentSectionIndex, currentTime, minPitch, maxPitch, songBeatLength, song, currentSection]);

    useEffect(() => {
        if (currentStatus === YouTube.PlayerState.ENDED && onSongEnd) onSongEnd(historicPlayerNotes.current);
    }, [currentStatus, historicPlayerNotes, onSongEnd]);

    const lyrics = isNotesSection(currentSection) ? (
        <LyricsContainer>
            <LyricsLine width={width}>
                {currentSection?.notes.map((note, index) => (
                    <span
                        key={note.start}
                        style={{
                            color: index === (currentNote ?? -1) ? styles.colors.text.active : undefined,
                        }}
                    >
                        {note.lyrics}
                    </span>
                ))}
            </LyricsLine>
            {isNotesSection(nextSection) && (
                <LyricsLine secondLine width={width}>
                    {nextSection?.notes.map((note) => (
                        <span key={note.start}>{note.lyrics}</span>
                    ))}
                </LyricsLine>
            )}
        </LyricsContainer>
    ) : (
        <LyricsContainer>&nbsp;</LyricsContainer>
    );

    const overlayHeight = height - 2 * 100 - 40;

    return (
        <Screen>
            <Scores height={overlayHeight}>
                <span><ScoreText score={calculateScore([...historicPlayerNotes.current[0], ...playerNotes.current[0]], song)} /></span>
                {/* <span><ScoreText score={calculateScore([...historicPlayerNotes.current[1], ...playerNotes.current[1]], song)} /></span> */}
            </Scores>
            {lyrics}
            <canvas ref={canvas} width={width} height={overlayHeight} />
            {lyrics}
        </Screen>
    );
}

const Screen = styled.div`
    padding: 20px 0;
    display: relative;
    color: white;
    -webkit-text-stroke: 2px black;
    font-weight: bold;
`;

const Scores = styled.div<{ height: number }>(
    ({ height }) => `
    height: ${height}px;
    margin-top: 100px;
    position: absolute;
    right: 10px;
    font-size: 35px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    text-align: right;
`,
);

const LyricsContainer = styled.div`
    box-sizing: border-box;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.35);
    height: 100px;
    width: 100%;
    text-align: center;
    line-height: 1;
`;

const LyricsLine = styled.div<{ secondLine?: boolean; width: number }>(
    ({ secondLine, width }) => `
    font-size: ${(width < 1000 ? 25 : 35) + (secondLine ? 0 : 10)}px;
    height: 45px;
    color: ${secondLine ? styles.colors.text.inactive : styles.colors.text.default};
`,
);

export default GameOverlay;
