import { DetailedScore } from '~/interfaces';
import GameState from '~/modules/game-engine/game-state/game-state';
import { emptyDetailedScore, sumDetailedScore } from '~/modules/game-engine/game-state/helpers/calculate-score';
import {
  getTrackTimelineRange,
  ScoreTimeline,
} from '~/modules/game-engine/game-state/helpers/calculate-score-timeline';
import { WireScoreTimeline } from '~/modules/online/protocol/types';
import { PlayerNumber } from '~/modules/players/player-number';

/**
 * How the results chart gets the same running score online as it does locally.
 *
 * Locally every timeline is sampled over one range, from the first beat anyone scored on to the
 * last. Online each singer computes only their own timeline, so that range can't be agreed on —
 * instead each samples the chart's notes (`getTrackTimelineRange`), the same on every machine, and
 * the results screen trims off the stretches where nobody scored with {@link trimIdleEdges}.
 */

/** Whole points are all the chart can show, and they keep the timeline small: it rides along in
 * every room-state publish. Zeroes are dropped too — most songs have no rap or golden notes. */
export const encodeScoreTimeline = (timeline: ScoreTimeline): WireScoreTimeline =>
  timeline.map((sample) =>
    Object.fromEntries(
      Object.entries(sample)
        .map(([type, score]) => [type, Math.round(score)] as const)
        .filter(([, score]) => score !== 0),
    ),
  );

/** This singer's timeline, ready to publish with their final score. Undefined when the song never
 * started for this browser, as when the host ends the game during readiness. */
export const getOwnScoreTimeline = (playerNumber: PlayerNumber): WireScoreTimeline | undefined => {
  const song = GameState.getSong();
  const player = GameState.getPlayer(playerNumber);
  if (!song || !player) return undefined;

  return encodeScoreTimeline(
    GameState.getPlayerScoreTimeline(playerNumber, getTrackTimelineRange(song, player.getTrackIndex())),
  );
};

export const decodeScoreTimeline = (wire: WireScoreTimeline): ScoreTimeline =>
  wire.map((sample) => ({ ...emptyDetailedScore(), ...sample }) as DetailedScore);

/**
 * Cuts the samples at either end where every line is flat — before anyone scored and after everyone
 * finished — keeping one flat sample at each cut so a line still starts from zero and settles on its
 * total. That leaves the span local play would have sampled over.
 */
export const trimIdleEdges = (timelines: ScoreTimeline[]): ScoreTimeline[] => {
  const totals = timelines.map((timeline) => timeline.map(sumDetailedScore));
  const length = totals[0]?.length ?? 0;
  // Samples only line up across equally long timelines, which singers on different builds may not send.
  if (length < 3 || totals.some((timeline) => timeline.length !== length)) return timelines;

  const isIdleAt = (sample: number, reference: (timeline: number[]) => number) =>
    totals.every((timeline) => timeline[sample] === reference(timeline));

  let start = 0;
  while (start < length - 2 && isIdleAt(start + 1, (timeline) => timeline[0])) start++;
  let end = length - 1;
  while (end > start + 1 && isIdleAt(end - 1, (timeline) => timeline[length - 1])) end--;

  return timelines.map((timeline) => timeline.slice(start, end + 1));
};
