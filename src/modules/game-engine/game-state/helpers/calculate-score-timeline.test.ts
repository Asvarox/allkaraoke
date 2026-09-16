import { PlayerNote } from '~/interfaces';
import { MAX_POINTS, sumDetailedScore } from '~/modules/game-engine/game-state/helpers/calculate-score';
import {
  SCORE_TIMELINE_SAMPLES,
  calculateScoreTimeline,
  getTimelineRange,
} from '~/modules/game-engine/game-state/helpers/calculate-score-timeline';
import { generateNote, generatePlayerNote, generateSong } from '~/modules/utils/test-utils';

describe('calculateScoreTimeline', () => {
  const note1 = generateNote(0, 5, { type: 'normal' });
  const note2 = generateNote(5, 5, { type: 'star' });
  const note3 = generateNote(10, 5, { type: 'normal' });
  const note4 = generateNote(15, 5, { type: 'star' });

  const song = generateSong([
    [
      { start: 0, type: 'notes', notes: [note1, note2] },
      { start: 0, type: 'notes', notes: [note3, note4] },
    ],
  ]);

  const sung = (...notes: (typeof note1)[]): PlayerNote[] =>
    notes.map((note) => generatePlayerNote(note, 0, 0, note.length, true, true));

  const perfectRun = sung(note1, note2, note3, note4);

  /** Timeline of one run, over the range that run alone would get. */
  const totalsOf = (run: PlayerNote[], sampleCount?: number) =>
    calculateScoreTimeline(run, song, 0, getTimelineRange(song, [run]), sampleCount).map(sumDetailedScore);

  it('starts at zero and ends on the final score', () => {
    const timeline = totalsOf(perfectRun);

    expect(timeline).toHaveLength(SCORE_TIMELINE_SAMPLES + 1);
    expect(timeline[0]).toEqual(0);
    expect(timeline.at(-1)).toBeCloseTo(MAX_POINTS, 5);
  });

  it('never goes down', () => {
    const timeline = totalsOf(perfectRun);

    timeline.forEach((score, sample) => {
      if (sample > 0) expect(score).toBeGreaterThanOrEqual(timeline[sample - 1]);
    });
  });

  it('credits a note gradually while it is still being sung', () => {
    // note1 runs beats 0-5 of 20, so a quarter of the way in it is exactly done and nothing else has
    // started — an eighth of the way in it should be half counted, not skipped.
    const [, ...timeline] = totalsOf(perfectRun, 8);

    expect(timeline[0]).toBeGreaterThan(0);
    expect(timeline[0]).toBeLessThan(timeline[1]);
  });

  it('ignores notes sung at the wrong pitch, like the final score does', () => {
    const missedRun = perfectRun.map((note) => generatePlayerNote(note.note, 3, 0, note.length, false, false));

    expect(totalsOf(missedRun).every((score) => score === 0)).toBe(true);
  });

  it('stays at zero across the whole song when nothing was sung', () => {
    expect(getTimelineRange(song, [[]])).toEqual({ startBeat: 0, endBeat: 20 });

    const timeline = totalsOf([]);
    expect(timeline).toHaveLength(SCORE_TIMELINE_SAMPLES + 1);
    expect(timeline.every((score) => score === 0)).toBe(true);
  });

  describe('trimming the stretches where nothing moves', () => {
    it('starts at the first scored beat instead of replaying a silent intro', () => {
      const lateRun = sung(note2, note3, note4);
      expect(getTimelineRange(song, [lateRun])).toEqual({ startBeat: 5, endBeat: 20 });

      // Already climbing by the second sample: no flat lead-in left.
      const timeline = totalsOf(lateRun);
      expect(timeline[0]).toEqual(0);
      expect(timeline[1]).toBeGreaterThan(0);
    });

    it('ends at the last scored beat instead of replaying a silent outro', () => {
      const earlyRun = sung(note1, note2);
      expect(getTimelineRange(song, [earlyRun])).toEqual({ startBeat: 0, endBeat: 10 });

      // Still climbing into the final sample: no flat tail left, and nothing cut off either.
      const timeline = totalsOf(earlyRun);
      expect(timeline.at(-2)).toBeLessThan(timeline.at(-1)!);
      expect(timeline.at(-1)).toBeCloseTo(
        sumDetailedScore(calculateScoreTimeline(earlyRun, song, 0, { startBeat: 0, endBeat: 20 }).at(-1)!),
        5,
      );
    });

    it('trims only what is flat for every player', () => {
      // One player sings only the first half, the other only the second: neither half is flat for
      // both of them, so the whole song stays.
      expect(getTimelineRange(song, [sung(note1, note2), sung(note3, note4)])).toEqual({ startBeat: 0, endBeat: 20 });
      // Both skip the first note: that stretch is flat for everyone and goes.
      expect(getTimelineRange(song, [sung(note2), sung(note3, note4)])).toEqual({ startBeat: 5, endBeat: 20 });
    });

    it('ignores wrong-pitch notes when deciding what to trim', () => {
      const offPitchOpener = generatePlayerNote(note1, 3, 0, note1.length, false, false);
      expect(getTimelineRange(song, [[offPitchOpener, ...sung(note2, note3, note4)]])).toEqual({
        startBeat: 5,
        endBeat: 20,
      });
    });
  });

  describe('sharing one range across players', () => {
    // A note sung past the song's own last beat: the range has to stretch to cover it, for every
    // player, or the same progress would mean a different moment of the song for each of them.
    const overrunNote = generateNote(18, 8, { type: 'normal' });
    const overrunRun = sung(overrunNote);

    it('stretches past the song when a player sang beyond its last beat', () => {
      expect(getTimelineRange(song, [perfectRun, overrunRun])).toEqual({ startBeat: 0, endBeat: 26 });
    });

    it('puts both players on the same beat at the same progress', () => {
      const range = getTimelineRange(song, [perfectRun, overrunRun]);
      const samples = 26;

      const steady = calculateScoreTimeline(perfectRun, song, 0, range, samples).map(sumDetailedScore);
      const overrun = calculateScoreTimeline(overrunRun, song, 0, range, samples).map(sumDetailedScore);

      // Beat 20 of 26 is where the song's own notes stop, so the steady player is done there while
      // the overrunning one is still climbing — which is only comparable because the axis is shared.
      expect(steady[20]).toBeCloseTo(steady.at(-1)!, 5);
      expect(overrun[20]).toBeLessThan(overrun.at(-1)!);
    });

    it('still ends every player on their own full total', () => {
      const range = getTimelineRange(song, [perfectRun, overrunRun]);

      expect(sumDetailedScore(calculateScoreTimeline(perfectRun, song, 0, range).at(-1)!)).toBeCloseTo(MAX_POINTS, 5);
      expect(sumDetailedScore(calculateScoreTimeline(overrunRun, song, 0, range).at(-1)!)).toBeGreaterThan(0);
    });
  });
});
