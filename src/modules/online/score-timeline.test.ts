import { emptyDetailedScore, sumDetailedScore } from '~/modules/game-engine/game-state/helpers/calculate-score';
import { decodeScoreTimeline, encodeScoreTimeline, trimIdleEdges } from '~/modules/online/score-timeline';

const timelineOf = (...totals: number[]) => totals.map((normal) => ({ ...emptyDetailedScore(), normal }));
const totalsOf = (timelines: ReturnType<typeof timelineOf>[]) =>
  timelines.map((timeline) => timeline.map(sumDetailedScore));

describe('encodeScoreTimeline', () => {
  it('sends whole points and leaves out note types nobody scored on', () => {
    const timeline = [emptyDetailedScore(), { ...emptyDetailedScore(), normal: 10.4, perfect: 2.6 }];

    expect(encodeScoreTimeline(timeline)).toEqual([{}, { normal: 10, perfect: 3 }]);
  });

  it('decodes back to full detailed scores', () => {
    const timeline = timelineOf(0, 50, 100);

    expect(decodeScoreTimeline(encodeScoreTimeline(timeline))).toEqual(timeline);
  });
});

describe('trimIdleEdges', () => {
  it('cuts the stretches where nobody scored, keeping one flat sample at each end', () => {
    const trimmed = trimIdleEdges([timelineOf(0, 0, 0, 10, 20, 20, 20), timelineOf(0, 0, 5, 5, 15, 15, 15)]);

    expect(totalsOf(trimmed)).toEqual([
      [0, 0, 10, 20],
      [0, 5, 5, 15],
    ]);
  });

  it('keeps a stretch where only one of the singers is still scoring', () => {
    const trimmed = trimIdleEdges([timelineOf(0, 10, 10, 10), timelineOf(0, 5, 10, 15)]);

    expect(totalsOf(trimmed)).toEqual([
      [0, 10, 10, 10],
      [0, 5, 10, 15],
    ]);
  });

  it('leaves at least two samples when nobody scored at all', () => {
    expect(totalsOf(trimIdleEdges([timelineOf(0, 0, 0, 0)]))).toEqual([[0, 0]]);
  });

  it('leaves timelines of different lengths alone, as their samples do not line up', () => {
    const timelines = [timelineOf(0, 0, 10), timelineOf(0, 0, 5, 5)];

    expect(trimIdleEdges(timelines)).toBe(timelines);
  });
});
