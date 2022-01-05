import { useEffect, useMemo, useRef, useState } from 'react';
import drawFrame from './Drawing';
import DummyInput from './Input/DummyInput';

import { PitchRecord, RelativeLine, Song } from '../../../interfaces';
import styles from './Drawing/styles';
import isNotesSection from './Helpers/isNotesSection';
import getSongBeatLength from './Helpers/getSongBeatLength';
import frequenciesToLines from './Helpers/frequenciesToLines';
import styled from 'styled-components';
import MicInput from './Input/MicInput';

const Input = DummyInput;
// const Input = MicInput;

interface Props {
    song: Song;
    currentTime: number;
    currentStatus: number;
    width: number;
    height: number;
}

const MAX_POINTS = 2500000;

function GameOverlay({ song, currentTime, currentStatus, width, height }: Props) {
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

    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);

    const currentSectionIndex = useMemo(() => song.tracks[0].sections.findIndex((section, index, sections) => {
        if (currentBeat < 0) return true;
        if (currentBeat < section.start) return false;
        if (index === sections.length - 1) return true;
        if (sections[index + 1].start > currentBeat) {
            return true;
        }
        return false;
    }), [currentBeat, song]);

    const currentSection = song.tracks[0].sections?.[currentSectionIndex];
    const nextSection = song.tracks[0].sections?.[currentSectionIndex + 1];

    const currentNote = useMemo(() => {
        if (!isNotesSection(currentSection) || currentBeat < 0) return null;
        const index = currentSection.notes.findIndex(note => currentBeat >= note.start && currentBeat < note.start + note.length)

        return index > -1 ? index : null;
    }, [currentBeat, currentSection]);

    const historicPitches = useRef<[PitchRecord[], PitchRecord[]]>([[], []]);
    const playerLines = useRef<[RelativeLine[], RelativeLine[]]>([[], []]);
    const historingPlayerLines = useRef<[RelativeLine[], RelativeLine[]]>([[], []]);

    const sungBeatsCount = useMemo(() => {
        let count = 0;
        song.tracks[0].sections.filter(isNotesSection).forEach(section => count = section.notes.reduce((acc, note) => acc + note.length, count));

        return count;
    }, [song]);


    useEffect(() => {
        historicPitches.current[0] = [];
        historicPitches.current[1] = [];

        historingPlayerLines.current[0] = [...historingPlayerLines.current[0], ...playerLines.current[0]];
        historingPlayerLines.current[1] = [...historingPlayerLines.current[1], ...playerLines.current[1]];

        playerLines.current[0] = [];
        playerLines.current[1] = [];
    }, [currentSectionIndex]);

    useEffect(() => {
        const score1 = [...historingPlayerLines.current[0], ...playerLines.current[0]]
            .filter(line => line.distance === 0)
            .reduce((sum, line) => sum + line.length, 0);
        const score2 = [...historingPlayerLines.current[1], ...playerLines.current[1]]
            .filter(line => line.distance === 0)
            .reduce((sum, line) => sum + line.length, 0);

        setScore1(score1);
        setScore2(score2);
    }, [currentTime])

    useEffect(() => {
        if (!canvas.current) return;

        if (currentTime >= song.gap && isNotesSection(currentSection)) {
            const [pitch1, pitch2] = Input.getFrequencies();

            historicPitches.current[0].push({ timestamp: currentTime, pitch: pitch1 });
            historicPitches.current[1].push({ timestamp: currentTime, pitch: pitch2 });

            playerLines.current[0] = frequenciesToLines(historicPitches.current[0], songBeatLength, song.gap, currentSection.notes);
            playerLines.current[1] = frequenciesToLines(historicPitches.current[1], songBeatLength, song.gap, currentSection.notes);
        }

        drawFrame(
            song,
            songBeatLength,
            minPitch,
            maxPitch,
            canvas.current!,
            currentTime,
            currentSectionIndex,
            historicPitches.current,
            playerLines.current,
        );
    }, [canvas, currentSectionIndex, currentTime, minPitch, maxPitch, songBeatLength, song, currentSection]);

    const lyrics = isNotesSection(currentSection) ? (
        <LyricsContainer>
            <LyricsLine width={width}>
                {currentSection?.notes.map((note, index) => (
                    <span
                        key={note.start}
                        style={{
                            color: index === (currentNote ?? -1) ? styles.colors.text.active : undefined,
                        }}>
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
    ) : <LyricsContainer>&nbsp;</LyricsContainer>;

    const overlayHeight = height - 2 * 100 - 40;

    return (
        <Screen>
            <Scores height={overlayHeight}>
                <span>{((score1 / sungBeatsCount) * MAX_POINTS).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span>{((score2 / sungBeatsCount) * MAX_POINTS).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
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

const Scores = styled.div<{ height: number }>(({ height }) => `
    height: ${height}px;
    margin-top: 100px;
    position: absolute;
    right: 10px;
    font-size: 35px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    text-align: right;
`);

const LyricsContainer = styled.div`
    box-sizing: border-box;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.35);
    height: 100px;
    width: 100%;
    text-align: center;
    line-height: 1;
    backdrop-filter: blur(20px);
`;

const LyricsLine = styled.div<{ secondLine?: boolean, width: number }>(({ secondLine, width }) => `
    font-size: ${(width < 1000 ? 25 : 35) + (secondLine ? 0 : 10)}px;
    height: 45px;
    color: ${secondLine ? styles.colors.text.inactive : styles.colors.text.default};
`);

export default GameOverlay;
