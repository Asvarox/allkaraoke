import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calcDistance } from './Helpers/calcDistance';
import drawFrame from './Drawing';
import DummyInput from './Input/DummyInput';

import { Note, PitchRecord, RelativeLine, Song } from '../../interfaces';

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

function pitchesToLines(pitches: PitchRecord[], beatLength: number, gap: number, notes: Note[]): RelativeLine[] {
    const playerLines: RelativeLine[] = [];

    notes.forEach(note => playerLines.push(
        ...pitches
            .map(({ timestamp, pitch }) => ({ pitch, timestamp: Math.max(0, timestamp - gap) / beatLength }))
            .filter(({ timestamp }) => timestamp >= note.start - 1 && timestamp <= note.start + note.length + 1)
            .map(({ timestamp, pitch }) => ({ timestamp, distance: calcDistance(pitch, note.pitch) }))
            .reduce<RelativeLine[]>((groups, playerLine) => {
                const lastGroup = groups[groups.length - 1];
                if (!lastGroup || lastGroup.distance !== playerLine.distance) {
                    groups.push({ start: Math.max(note.start, playerLine.timestamp), length: 0, distance: playerLine.distance, note, })
                } else {
                    lastGroup.length = Math.min(playerLine.timestamp - lastGroup.start, note.start + note.length - lastGroup.start);
                }
    
                return groups;
            }, [])
            .filter(playerLine => playerLine.distance > -Infinity)
    ));

    return playerLines;
}

function GameOverlay({ song, currentTime, currentStatus, width, height }: Props) {
    const canvas = useRef<HTMLCanvasElement | null>(null);

    const songBeatLength = useMemo(() => (60 / song.bpm / song.bar) * 1000, [song]);
    const [minPitch, maxPitch] = useMemo(() => {
        let min: number = Infinity;
        let max: number = -Infinity;

        song.sections.forEach((section) =>
            section.notes.forEach((note) => {
                min = Math.min(min, note.pitch);
                max = Math.max(max, note.pitch);
            }),
        );

        return [min, max];
    }, [song]);

    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);

    const [currentSection, setCurrentSection] = useState(0);
    const [currentNote, setCurrentNote] = useState<number | null>(null);
    const historicPitches = useRef<[PitchRecord[], PitchRecord[]]>([[], []]);
    const playerLines = useRef<[RelativeLine[], RelativeLine[]]>([[], []]);
    const historingPlayerLines = useRef<[RelativeLine[], RelativeLine[]]>([[], []]);

    const sungBeatsCount = useMemo(() => {
        let count = 0;
        song.sections.forEach(section => count = section.notes.reduce((acc, note) => acc + note.length, count));

        return count;
    }, [song]);

    useEffect(() => {
        Input.startMonitoring();
    }, []);

    useEffect(() => {
        if (currentTime < song.gap || song.sections[currentSection + 1] === undefined) return;

        const currentBeat = Math.floor((currentTime - song.gap) / songBeatLength);

        if (song.sections[currentSection + 1].start <= currentBeat) {
            setCurrentNote(null);
            setCurrentSection(currentSection + 1);
        } else {
            const currentNoteIndex = song.sections[currentSection].notes.findIndex((note) => {
                return note.start <= currentBeat && note.start + note.length > currentBeat;
            });
            setCurrentNote(currentNoteIndex);
        }
    }, [song, songBeatLength, currentTime, currentSection]);

    useEffect(() => {
        historicPitches.current[0] = [];
        historicPitches.current[1] = [];

        historingPlayerLines.current[0] = [...historingPlayerLines.current[0], ...playerLines.current[0]];
        historingPlayerLines.current[1] = [...historingPlayerLines.current[1], ...playerLines.current[1]];

        playerLines.current[0] = [];
        playerLines.current[1] = [];
    }, [currentSection]);

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

        if (currentTime >= song.gap) {
            const [pitch1, pitch2] = Input.getFrequencies();

            historicPitches.current[0].push({ timestamp: currentTime, pitch: pitch1 });
            historicPitches.current[1].push({ timestamp: currentTime, pitch: pitch2 });

            playerLines.current[0] = pitchesToLines(historicPitches.current[0], songBeatLength, song.gap, song.sections[currentSection].notes);
            playerLines.current[1] = pitchesToLines(historicPitches.current[1], songBeatLength, song.gap, song.sections[currentSection].notes);
        }

        drawFrame(
            song,
            songBeatLength,
            minPitch,
            maxPitch,
            canvas.current!,
            currentTime,
            currentSection,
            historicPitches.current,
            playerLines.current,
        );
    }, [canvas, currentSection, currentTime, minPitch, maxPitch, songBeatLength, song]);

    const lyrics = (
        <div className="screen__lyrics">
            <div className="screen__lyrics--first-line">
                {song.sections?.[currentSection]?.notes.map((note, index) => (
                    <span
                        key={note.start}
                        style={{
                            color: index === (currentNote ?? -1) ? 'orange' : undefined,
                        }}>
                        {note.lyrics}&nbsp;
                    </span>
                ))}
            </div>
            {song.sections?.[currentSection + 1] && (
                <div className="screen__lyrics--second-line">
                    {song.sections?.[currentSection + 1]?.notes.map((note) => (
                        <span key={note.start}>{note.lyrics}&nbsp;</span>
                    ))}
                </div>
            )}
        </div>
    );

    const overlayHeight = height - 2 * 100 - 40;

    return (
        <div className="screen">
            <div className="screen__scores" style={{ height: overlayHeight }}>
                <span>{((score1 / sungBeatsCount) * MAX_POINTS).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span>{((score2 / sungBeatsCount) * MAX_POINTS).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            {lyrics}
            <div>
                <canvas ref={canvas} width={width} height={overlayHeight} />
            </div>
            {lyrics}
        </div>
    );
}

export default GameOverlay;
