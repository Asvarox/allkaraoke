import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { calcDistance } from './calcDistance';
import drawFrame from './Drawing';
import DummyInput from './Input/DummyInput';

import { PitchRecord, Song } from './interfaces';

const Input = DummyInput;
// const Input = MicInput;

interface Props {
  song: Song,
  currentTime: number,
  currentStatus: number,
  width: number,
  height: number,
}

function GameOverlay({ song, currentTime, currentStatus, width, height }: Props) {
  const canvas = useRef<HTMLCanvasElement | null>(null);

  const songBeatLength = useMemo(() => (60 / song.bpm / song.bar) * 1000, [song]);
  const minPitch = useMemo(() => song.sections.reduce((smallest, section) => Math.min(smallest, ...section.notes.map(note => note.pitch)), Infinity), [song]);
  const maxPitch = useMemo(() => song.sections.reduce((smallest, section) => Math.max(smallest, ...section.notes.map(note => note.pitch)), -Infinity), [song]);

  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  const [currentSection, setCurrentSection] = useState(0); 
  const [currentNote, setCurrentNote] = useState<number | null>(null); 
  const historicPitches = useRef<[PitchRecord[], PitchRecord[]]>([[], []]);


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
      const currentNoteIndex = song.sections[currentSection].notes.findIndex(note => {
        return note.start <= currentBeat && (note.start + note.length) > currentBeat
      });
      setCurrentNote(currentNoteIndex)
    }

  }, [song, songBeatLength, currentTime, currentSection]);

  useEffect(() => {
    if (!song.sections[currentSection - 1]) return;

    const reduceFunc = (pitches: PitchRecord[]) => {
      return (currentScore: number, note: { length: number, start: number, pitch: number }) => {
      const relevantPitches = pitches.filter(
        pitch => pitch.timestamp >= (note.start * songBeatLength) + song.gap && pitch.timestamp < ((note.start + note.length) * songBeatLength) + song.gap
      );
      const distances = relevantPitches.map(pitch => calcDistance(pitch.pitch, note.pitch));

      return currentScore + (distances.reduce((sum, distance) => sum + (12 - distance), 0) / (distances.length + 1));
    }}

    const sectionScore1 = song.sections[currentSection - 1].notes.reduce(reduceFunc(historicPitches.current[0]), 0);
    const sectionScore2 = song.sections[currentSection - 1].notes.reduce(reduceFunc(historicPitches.current[1]), 0);

    setScore1(score => score + sectionScore1)
    setScore2(score => score + sectionScore2)

    historicPitches.current[0] = [];
    historicPitches.current[1] = [];
  }, [currentSection, song, songBeatLength]);

  useEffect(() => {
    const [pitch1, pitch2] = Input.getFrequencies();
    if (!canvas.current) return;

    historicPitches.current[0].push({ timestamp: currentTime, pitch: pitch1 });
    historicPitches.current[1].push({ timestamp: currentTime, pitch: pitch2 });

    drawFrame(song, songBeatLength, minPitch, maxPitch, canvas.current!, currentTime, currentSection, historicPitches.current);

  }, [canvas, currentSection, currentTime, minPitch, maxPitch, songBeatLength, song]);

  const lyrics = <div className="screen__lyrics">
    <div className="screen__lyrics--first-line">
          {song.sections?.[currentSection]?.notes.map((note, index) => (
            <span key={note.start} style={{ color: index === (currentNote ?? -1) ? 'orange' : undefined}}>{note.lyrics}&nbsp;</span>
          ))}
    </div>
    {song.sections?.[currentSection + 1] && <div className="screen__lyrics--second-line">
              {song.sections?.[currentSection + 1]?.notes.map((note, index) => (
                <span key={note.start}>{note.lyrics}&nbsp;</span>
              ))}

    </div>}
  </div>

  return (
    <div className="screen">
          {lyrics}
          <canvas ref={canvas} width={width} height={height - (2 * 100) - 40} />
          {lyrics}
    </div>
  );
}



export default GameOverlay;
