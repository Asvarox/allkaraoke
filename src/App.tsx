import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs'
import logo from './logo.svg';
import './App.css';
import usePitch from './usePitch';
import YouTube from 'react-youtube';

import song from './songs/netflix-toss-a-coin-to-your-witcher.json';
import { setTextRange } from 'typescript';
import usePitch2 from './usePitch2';
import usePitch3 from './usePitch3';
import usePitch4 from './usePitch4';

const dstyle = {
  position: 'absolute' as any,
  // zIndex: 1, 
  // backgroundColor: 'rgba(0, 0, 0, .2)',
  width: '640px',
  height: '300px',
  textAlign: 'center' as any,
  fontSize: '30px',
  fontWeight: 'bold', 
  WebkitTextStroke: '1px white'
}

const songBeatLength = (60 / song.bpm / song.bar) * 1000;
const minPitch = song.sections.reduce((smallest, section) => Math.min(smallest, ...section.notes.map(note => note.pitch)), Infinity);
const maxPitch = song.sections.reduce((smallest, section) => Math.max(smallest, ...section.notes.map(note => note.pitch)), -Infinity);

// song.gap = 0;

const MIDDLEA = 440;
const SEMITONE = 69;

const noteFromFreq = (freq: number) => Math.round(12 * (Math.log(freq / MIDDLEA) / Math.log(2))) + SEMITONE;

const noteStrings = [
'C',
'C♯',
'D',
'D♯',
'E',
'F',
'F♯',
'G',
'G♯',
'A',
'A♯',
'B',
'-',
];


const calcDistance = (frequency: number, targetNote: number) => {
  const note = noteFromFreq(frequency);
  const tolerance = 1;
  const noteDistance = (((note % 12) - (targetNote % 12) + 6) % 12) - 6;
  const toleratedDistance = Math.max(0, Math.abs(noteDistance) - tolerance) * Math.sign(noteDistance); 

  return toleratedDistance;
}

function App() {
  const [getPitch2, getPitch1] = usePitch3();
  // const [getPitch2, start2] = usePitch4();
  // const getPitch1 = () => 241;
  // const getPitch2 = () => 0;
  const player = useRef<YouTube | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  const [currentScreen, setCurrentScreen] = useState(0); 
  const [currentLine, setCurrentLine] = useState<number | null>(null); 
  const historicPitch1 = useRef<Array<{ timestamp: number, pitch: number}>>([]);
  const historicPitch2 = useRef<Array<{ timestamp: number, pitch: number}>>([]);

  useEffect(() => {
    if (!player.current) {
      return undefined;
    }
    const interval = setInterval(async () => {
      setCurrentTime(await player.current!.getInternalPlayer().getCurrentTime() * 1000);
    }, 16);

    return () => clearInterval(interval);
  }, [player]);

  useEffect(() => {
    if (currentTime < song.gap || song.sections[currentScreen + 1] === undefined) return;
    
    const currentBeat = Math.floor((currentTime - song.gap) / songBeatLength);

    if (song.sections[currentScreen + 1].start <= currentBeat) {
      setCurrentLine(null);
      setCurrentScreen(currentScreen + 1);
    } else {
      const currentNoteIndex = song.sections[currentScreen].notes.findIndex(note => {
        return note.start <= currentBeat && (note.start + note.length) > currentBeat
      });
      setCurrentLine(currentNoteIndex)
    }

    
  }, [currentTime, currentScreen]);

  useEffect(() => {
    if (!song.sections[currentScreen - 1]) return;

    const reduceFunc = (pitches: typeof historicPitch1.current) => {
      return (currentScore: number, note: { length: number, start: number, pitch: number }) => {
      const relevantPitches = pitches.filter(
        pitch => pitch.timestamp >= (note.start * songBeatLength) + song.gap && pitch.timestamp < ((note.start + note.length) * songBeatLength) + song.gap
      );
      const distances = relevantPitches.map(pitch => calcDistance(pitch.pitch, note.pitch));

      return currentScore + (distances.reduce((sum, distance) => sum + (12 - distance), 0) / (distances.length + 1));
    }}

    const sectionScore1 = song.sections[currentScreen - 1].notes.reduce(reduceFunc(historicPitch1.current), 0);
    const sectionScore2 = song.sections[currentScreen - 1].notes.reduce(reduceFunc(historicPitch2.current), 0);

    setScore1(score => score + sectionScore1)
    setScore2(score => score + sectionScore2)

    historicPitch1.current = [];
    historicPitch2.current = [];
  }, [currentScreen]);

  useEffect(() => {
    if (!canvas.current) return;

    if (getPitch1() > 0) historicPitch1.current.push({ timestamp: currentTime, pitch: getPitch1() });
    if (getPitch2() > 0) historicPitch2.current.push({ timestamp: currentTime, pitch: getPitch2() });

    const ctx = canvas.current.getContext('2d');
    ctx!.clearRect(0, 0, canvas.current.width, canvas.current.height);

    const pitchPadding = 6;
    
    const section = song.sections[currentScreen];
    const lastNote = section.notes[section.notes.length - 1];
    const timeSectionGap = (section.start * songBeatLength) + song.gap;
    const relativeTime = Math.max(0, currentTime - timeSectionGap);
    const maxTime = (lastNote.start + lastNote.length - section.start) * songBeatLength;

    const beatLength = (canvas.current.width - 20) / ((lastNote.start + lastNote.length) - section.start);
    const pitchStepHeight = (canvas.current.height - 20) / (maxPitch - minPitch + (pitchPadding * 2));
    // console.log('pitchStepHeight', pitchStepHeight, maxPitch, minPitch, (maxPitch - minPitch + (pitchPadding * 2)))

    ctx!.fillStyle = 'green';

    section.notes.forEach(note => {
      ctx?.fillRect(
        10 + (beatLength * (note.start - section.start)),
        10 + (pitchStepHeight * (maxPitch - note.pitch + pitchPadding)),
        beatLength * note.length,
        20
      );
    });
    ctx!.strokeStyle = 'black';
    const timeLineX = 10 + (relativeTime / maxTime) * (canvas.current.width - 20);
    ctx!.beginPath();
    ctx!.moveTo(timeLineX, 0);
    ctx!.lineTo(timeLineX, canvas.current.height);
    ctx!.stroke();

    let padding = 0;
    let previousNote: { pitch: number, lyrics: string } = section.notes[0];

    const draw = (entry: {pitch: number, timestamp: number}) => {
      const currentBeat = Math.max(0, Math.floor((entry.timestamp - song.gap) / songBeatLength));
      // console.log(currentTime, currentBeat, section.notes)
      const noteAtTheTime = section.notes.find(note => note.start <= currentBeat && (note.start + note.length) > currentBeat) ?? previousNote;
      // const notePitchAtTheTime = section.notes[0].pitch;
      previousNote = noteAtTheTime;

      if (noteAtTheTime === undefined) return;

      const entryRelativeTime = Math.max(0, entry.timestamp - timeSectionGap);
      const entryX = 10 + (entryRelativeTime / maxTime) * (canvas.current!.width - 20)

      const toleratedDistance = calcDistance(entry.pitch, noteAtTheTime.pitch);
      const final = maxPitch - (noteAtTheTime.pitch + toleratedDistance) + pitchPadding;
      // const note = noteFromFreq(entry.pitch);
      // console.log(noteAtTheTime.lyrics, note, noteAtTheTime.pitch, note % 12, noteAtTheTime.pitch % 12, toleratedDistance);

      ctx?.fillRect(
        entryX - 20,
        10 + (final * pitchStepHeight),
        20,
        20
      );
      // ctx!.beginPath()
      // ctx!.arc(entryX, 10 + padding + ((pitchPadding + final) * pitchStepHeight), 5, 0, 2 * Math.PI);
      // ctx!.fill();

    }
    
    ctx!.fillStyle = 'rgba(255, 0, 0, .15)';
    historicPitch1.current.forEach(draw);

    padding = 5;
    previousNote = section.notes[0];
    ctx!.fillStyle = 'rgba(0, 0, 255, .15)';
    historicPitch2.current.forEach(draw);
  }, [canvas, currentScreen, currentTime]);


  const pitch1 = getPitch1();
  const pitch2 = getPitch2();

  return (
    <div className="App">
      Current: {pitch1 > 0 ? noteStrings[noteFromFreq(pitch1) % 12] : '-'}, {score1.toFixed(0)} <br />
      Current: {pitch2 > 0 ? noteStrings[noteFromFreq(pitch2) % 12] : '-'}, {score2.toFixed(0)} <br />
      Needed: {currentLine !== null ? noteStrings[(song.sections?.[currentScreen].notes[currentLine]?.pitch) % 12 ?? 12] : '-'}
      {/* {pitch > 0 ? noteFromFreq(pitch) : '-'} */}
        <div style={{ position: 'relative'}}>
          <div style={dstyle}>

              {song.sections?.[currentScreen]?.notes.map((note, index) => (
                <span key={note.start} style={{ color: index <= (currentLine ?? -1) ? 'orange' : 'black'}}>{note.lyrics}&nbsp;</span>
              ))}
              <br />
              <br />
              <span style={{ color: 'grey'}}>
              {song.sections?.[currentScreen + 1]?.notes.map(note => (
                <span key={note.start}>{note.lyrics}&nbsp;</span>
              ))}</span>
          </div>
          <YouTube ref={player} videoId={song.video} opts={{ playerVars: { autoplay: 0 }}} />
          <canvas ref={canvas} width={640} height={220} />
          <button onClick={() => {
            player.current!.getInternalPlayer().playVideo();
          }}>Start</button>
        </div>
    </div>
  );
}

export default App;
