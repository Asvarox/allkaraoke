import { DetailedScore } from '~/interfaces';
import { emptyDetailedScore, multiplyDetailedScore } from '~/modules/game-engine/game-state/helpers/calculate-score';
import { PlayerScore } from '~/routes/game/singing/post-game/post-game-view';
import { easeOutReveal, getRevealedTotal } from '~/routes/game/singing/post-game/views/results/score-utils';

const finalScore: DetailedScore = { ...emptyDetailedScore(), normal: 1_000 };

const player = (scoreTimeline?: DetailedScore[]): PlayerScore => ({
  name: 'Player',
  playerNumber: 0,
  detailedScore: [finalScore, finalScore],
  scoreTimeline,
});

describe('easeOutReveal', () => {
  it('starts and ends where the raw clock does', () => {
    expect(easeOutReveal(0)).toEqual(0);
    expect(easeOutReveal(1)).toEqual(1);
  });

  it('runs ahead of the clock, so the last stretch is the slow one', () => {
    expect(easeOutReveal(0.5)).toBeGreaterThan(0.5);
    // Seven eighths of the score is already on screen by the half-way mark.
    expect(easeOutReveal(0.5)).toBeCloseTo(0.875, 5);
  });

  it('never goes backwards', () => {
    const steps = new Array(50).fill(0).map((_, step) => easeOutReveal(step / 49));

    steps.forEach((value, step) => {
      if (step > 0) expect(value).toBeGreaterThanOrEqual(steps[step - 1]);
    });
  });

  it('settles rather than stopping dead — the final stretch covers little ground', () => {
    // The last tenth of the clock is worth a tenth of a percent of the score: the visible settle.
    expect(1 - easeOutReveal(0.9)).toBeLessThan(0.002);
  });
});

describe('getRevealedTotal', () => {
  // A player who sang nothing for the first half, then everything in the second.
  const backloaded = [0, 0, 0.5, 1].map((share) => multiplyDetailedScore(finalScore, share));

  it('follows the timeline rather than the clock', () => {
    expect(getRevealedTotal(player(backloaded), 0)).toEqual(0);
    expect(getRevealedTotal(player(backloaded), 1 / 3)).toEqual(0);
    expect(getRevealedTotal(player(backloaded), 2 / 3)).toEqual(500);
    expect(getRevealedTotal(player(backloaded), 1)).toEqual(1_000);
  });

  it('interpolates between samples so the number moves every frame', () => {
    expect(getRevealedTotal(player(backloaded), 0.5)).toEqual(250);
  });

  it('ramps the totals linearly when there is no timeline, as online has none', () => {
    expect(getRevealedTotal(player(), 0)).toEqual(0);
    expect(getRevealedTotal(player(), 0.25)).toEqual(250);
    expect(getRevealedTotal(player(), 1)).toEqual(1_000);
  });

  it('lands exactly on the final score once the reveal is over', () => {
    expect(getRevealedTotal(player(backloaded), 1.5)).toEqual(1_000);
    expect(getRevealedTotal(player(), 1.5)).toEqual(1_000);
  });
});
