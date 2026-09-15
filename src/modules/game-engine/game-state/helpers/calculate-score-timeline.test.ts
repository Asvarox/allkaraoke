import { PlayerNote } from '~/interfaces';
import { MAX_POINTS, sumDetailedScore } from '~/modules/game-engine/game-state/helpers/calculate-score';
import {
  SCORE_TIMELINE_SAMPLES,
  calculateScoreTimeline,
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

  const perfectRun: PlayerNote[] = [
    generatePlayerNote(note1, 0, 0, note1.length, true, true),
    generatePlayerNote(note2, 0, 0, note2.length, true, true),
    generatePlayerNote(note3, 0, 0, note3.length, true, true),
    generatePlayerNote(note4, 0, 0, note4.length, true, true),
  ];

  it('starts at zero and ends on the final score', () => {
    const timeline = calculateScoreTimeline(perfectRun, song, 0);

    expect(timeline).toHaveLength(SCORE_TIMELINE_SAMPLES + 1);
    expect(sumDetailedScore(timeline[0])).toEqual(0);
    expect(sumDetailedScore(timeline.at(-1)!)).toBeCloseTo(MAX_POINTS, 5);
  });

  it('never goes down', () => {
    const timeline = calculateScoreTimeline(perfectRun, song, 0).map(sumDetailedScore);

    timeline.forEach((score, sample) => {
      if (sample > 0) expect(score).toBeGreaterThanOrEqual(timeline[sample - 1]);
    });
  });

  it('credits a note gradually while it is still being sung', () => {
    // note1 runs beats 0-5 of the song's 20, so a quarter of the way in it is exactly done and
    // nothing else has started — an eighth of the way in it should be half counted, not skipped.
    const [, ...timeline] = calculateScoreTimeline(perfectRun, song, 0, 8).map(sumDetailedScore);

    expect(timeline[0]).toBeGreaterThan(0);
    expect(timeline[0]).toBeLessThan(timeline[1]);
  });

  it('ignores notes sung at the wrong pitch, like the final score does', () => {
    const missedRun = perfectRun.map((note) => generatePlayerNote(note.note, 3, 0, note.length, false, false));
    const timeline = calculateScoreTimeline(missedRun, song, 0);

    expect(timeline.every((sample) => sumDetailedScore(sample) === 0)).toBe(true);
  });

  it('stays at zero throughout when nothing was sung', () => {
    const timeline = calculateScoreTimeline([], song, 0);

    expect(timeline).toHaveLength(SCORE_TIMELINE_SAMPLES + 1);
    expect(timeline.every((sample) => sumDetailedScore(sample) === 0)).toBe(true);
  });
});
