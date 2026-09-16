import { DetailedScore } from '~/interfaces';
import {
  lerpDetailedScores,
  multiplyDetailedScore,
  sumDetailedScore,
} from '~/modules/game-engine/game-state/helpers/calculate-score';
import { PlayerScore } from '~/routes/game/singing/post-game/post-game-view';

/** How long the reveal takes to play the whole song back, in milliseconds. */
export const REVEAL_DURATION = 8_000;

/** The pause between the scores landing on their totals and the winner being called. */
export const WINNER_REVEAL_DELAY = 900;

/** Eases the reveal off towards the end, so the scores coast to a stop instead of stopping dead on
 * their final digit. Cubic: the song is most of the way told by the half-way mark, and the last
 * stretch is a visible settle rather than a hard stop. */
export function easeOutReveal(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

/**
 * The score a player had reached `progress` (0–1) of the way through the song. Everything on the
 * results screen — each row's total, its four bars, and the chart — reads its value from here, which
 * is what keeps them showing the same moment of the song as each other.
 */
export function getRevealedScore(player: PlayerScore, progress: number): DetailedScore {
  const [finalScore] = player.detailedScore;
  const timeline = player.scoreTimeline;

  if (progress >= 1) return finalScore;
  // Online sends no timeline, so there is nothing to reveal progressively — ramp the totals instead.
  if (!timeline || timeline.length < 2) return multiplyDetailedScore(finalScore, progress);

  const position = Math.max(0, progress) * (timeline.length - 1);
  const sample = Math.floor(position);

  return lerpDetailedScores(timeline[sample], timeline[Math.min(sample + 1, timeline.length - 1)], position - sample);
}

export function getRevealedTotal(player: PlayerScore, progress: number): number {
  return sumDetailedScore(getRevealedScore(player, progress));
}
