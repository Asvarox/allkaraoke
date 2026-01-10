import { GAME_MODE, songBeat } from 'interfaces';
import { PassTheMicUiArgs, PassTheMicUiState } from './types';

export const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(max, value));

export const hasLyricTrailingSpace = (lyrics: string) => lyrics.endsWith(' ');

export const getHeadstartPercent = (
  currentBeat: songBeat,
  sectionStartBeat: songBeat,
  beatsBetweenSectionAndNote: number,
) => {
  if (beatsBetweenSectionAndNote <= 0) return 2;
  return clamp(0, (currentBeat - sectionStartBeat) / beatsBetweenSectionAndNote, 2);
};

export const getNoteFill = (currentBeat: songBeat, note: { start: songBeat; length: number }) => {
  return clamp(0, (currentBeat - note.start) / note.length, 2);
};

export const getPassTheMicUiState = (args: PassTheMicUiArgs): PassTheMicUiState => {
  if (args.mode !== GAME_MODE.PASS_THE_MIC) {
    return {
      shouldBlink: false,
      showProgressBar: false,
      progressPercent: 0,
      showSwapOnCurrentLine: false,
      showSwapOnNextLine: false,
    };
  }

  const sectionStart = args.sectionStart ?? null;
  const changes = args.changes;

  const previousChange = Math.max(
    0,
    ...changes.filter((beat) => (sectionStart === null ? false : beat <= sectionStart)),
  );
  const nextChange = changes.find((beat) => (sectionStart === null ? false : beat > sectionStart)) ?? Infinity;
  const timeToNextChange = (nextChange - args.currentBeat) * args.beatLengthMs;

  const passTheMicProgress = (nextChange - args.currentBeat) / (nextChange - previousChange);

  return {
    shouldBlink: timeToNextChange < 2500,
    showProgressBar: timeToNextChange < Infinity,
    progressPercent: passTheMicProgress <= 1 ? passTheMicProgress * 100 : 0,
    showSwapOnCurrentLine: args.nextSectionStart !== null && args.nextSectionStart === nextChange,
    showSwapOnNextLine: args.subsequentSectionStart !== null && args.subsequentSectionStart === nextChange,
  };
};
