import { PlayerNote } from '~/interfaces';
import { MAX_POINTS, sumDetailedScore } from '~/modules/game-engine/game-state/helpers/calculate-score';
import {
  SCORE_TIMELINE_SAMPLES,
  calculateScoreTimeline,
  getTimelineEndBeat,
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

  /** The single-player case: the endpoint is whatever that one run needs. */
  const endBeatFor = (run: PlayerNote[]) => getTimelineEndBeat(song, [run]);

  it('starts at zero and ends on the final score', () => {
    const timeline = calculateScoreTimeline(perfectRun, song, 0, endBeatFor(perfectRun));

    expect(timeline).toHaveLength(SCORE_TIMELINE_SAMPLES + 1);
    expect(sumDetailedScore(timeline[0])).toEqual(0);
    expect(sumDetailedScore(timeline.at(-1)!)).toBeCloseTo(MAX_POINTS, 5);
  });

  it('never goes down', () => {
    const timeline = calculateScoreTimeline(perfectRun, song, 0, endBeatFor(perfectRun)).map(sumDetailedScore);

    timeline.forEach((score, sample) => {
      if (sample > 0) expect(score).toBeGreaterThanOrEqual(timeline[sample - 1]);
    });
  });

  it('credits a note gradually while it is still being sung', () => {
    // note1 runs beats 0-5 of the song's 20, so a quarter of the way in it is exactly done and
    // nothing else has started — an eighth of the way in it should be half counted, not skipped.
    const [, ...timeline] = calculateScoreTimeline(perfectRun, song, 0, endBeatFor(perfectRun), 8).map(
      sumDetailedScore,
    );

    expect(timeline[0]).toBeGreaterThan(0);
    expect(timeline[0]).toBeLessThan(timeline[1]);
  });

  it('ignores notes sung at the wrong pitch, like the final score does', () => {
    const missedRun = perfectRun.map((note) => generatePlayerNote(note.note, 3, 0, note.length, false, false));
    const timeline = calculateScoreTimeline(missedRun, song, 0, endBeatFor(missedRun));

    expect(timeline.every((sample) => sumDetailedScore(sample) === 0)).toBe(true);
  });

  describe('sharing one endpoint across players', () => {
    // A note sung past the song's own last beat: the endpoint has to stretch to cover it, for every
    // player, or the same progress would mean a different moment of the song for each of them.
    const overrunNote = generateNote(18, 8, { type: 'normal' });
    const overrunRun: PlayerNote[] = [generatePlayerNote(overrunNote, 0, 0, overrunNote.length, true, true)];

    it('stretches past the song when a player sang beyond its last beat', () => {
      expect(getTimelineEndBeat(song, [perfectRun])).toEqual(20);
      expect(getTimelineEndBeat(song, [perfectRun, overrunRun])).toEqual(26);
    });

    it('puts both players on the same beat at the same progress', () => {
      const endBeat = getTimelineEndBeat(song, [perfectRun, overrunRun]);
      const samples = 26;

      const steady = calculateScoreTimeline(perfectRun, song, 0, endBeat, samples).map(sumDetailedScore);
      const overrun = calculateScoreTimeline(overrunRun, song, 0, endBeat, samples).map(sumDetailedScore);

      // Beat 20 of 26 is where the song's own notes stop, so the steady player is done there while
      // the overrunning one is still climbing — which is only comparable because the axis is shared.
      expect(steady[20]).toBeCloseTo(steady.at(-1)!, 5);
      expect(overrun[20]).toBeLessThan(overrun.at(-1)!);
    });

    it('still ends every player on their own full total', () => {
      const endBeat = getTimelineEndBeat(song, [perfectRun, overrunRun]);

      expect(sumDetailedScore(calculateScoreTimeline(perfectRun, song, 0, endBeat).at(-1)!)).toBeCloseTo(MAX_POINTS, 5);
      expect(sumDetailedScore(calculateScoreTimeline(overrunRun, song, 0, endBeat).at(-1)!)).toBeGreaterThan(0);
    });
  });

  it('stays at zero throughout when nothing was sung', () => {
    const timeline = calculateScoreTimeline([], song, 0, endBeatFor([]));

    expect(timeline).toHaveLength(SCORE_TIMELINE_SAMPLES + 1);
    expect(timeline.every((sample) => sumDetailedScore(sample) === 0)).toBe(true);
  });
});
