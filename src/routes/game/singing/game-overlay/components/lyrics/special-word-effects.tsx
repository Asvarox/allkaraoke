import LyricNoteToken from './lyric-note-token';
import { LyricWordEffect } from './word-effects';

const renderFireWord: LyricWordEffect['renderWord'] = ({ notes, currentBeat, playerColor }) => (
  <span className="relative">
    <span className="relative z-1">
      {notes.map((note) => (
        <LyricNoteToken key={note.start} note={note} currentBeat={currentBeat} playerColor={playerColor} />
      ))}
    </span>
    <span className="absolute right-0 z-0">🔥</span>
  </span>
);

const renderDefault: LyricWordEffect['renderWord'] = ({ notes, currentBeat, playerColor }) =>
  notes.map((note) => (
    <LyricNoteToken key={note.start} note={note} currentBeat={currentBeat} playerColor={playerColor} />
  ));

export const specialLyricWordEffects: LyricWordEffect[] = [
  {
    // Heat / combustion: warm gradient, flame flicker, or soft ember glow.
    words: ['fire', 'flame', 'spark', 'blaze', 'burning', 'ashes', 'smoke'],
    renderWord: renderFireWord,
  },
  {
    // Water / weather: rain streak overlay, drip animation, or ripple distortion.
    words: ['rain', 'pouring rain', 'storm', 'flood', 'wave', 'tide'],
    renderWord: renderDefault,
  },
  {
    // Water / weather: rain streak overlay, drip animation, or ripple distortion.
    words: ['thunder', 'lightning'],
    renderWord: renderDefault,
  },
  {
    // Sky / atmosphere: airy shimmer, cloud drift parallax, or horizon gradient sweep.
    words: ['sky', 'clouds', 'sun', 'moon', 'stars', 'dawn', 'dusk', 'eclipse'],
    renderWord: renderDefault,
  },
  {
    // Neon / city / electric: chromatic aberration, scanline pulse, or neon tube glow.
    words: ['neon', 'light', 'lights', 'electric', 'static', 'pulse', 'city', 'street', 'siren'],
    renderWord: renderDefault,
  },
  {
    // Conflict / impact: jitter shake, impact pop, or quick flash on note activation.
    words: ['fight', 'broken', 'scream', 'boom', 'crash', 'bleeding', 'venom', 'poison'],
    renderWord: renderDefault,
  },
  {
    // Dark / dramatic: shadow bloom, vignette pulse, or ghost trail.
    words: ['shadow', 'ghost', 'devil', 'heaven', 'hell', 'midnight', 'silence', 'whisper'],
    renderWord: renderDefault,
  },
  {
    // Raw language / emphasis: comic-book punch, pixel glitch, or censored bleep pop.
    words: ['crap', 'damn', 'shit', 'fuck'],
    renderWord: renderDefault,
  },
];
