import { useMemo } from 'react';

import Box from '~/modules/elements/akui/primitives/box';
import { Typography } from '~/modules/elements/akui/primitives/typography';
import styles from '~/modules/game-engine/drawing/styles';
import { sumDetailedScore } from '~/modules/game-engine/game-state/helpers/calculate-score';
import { PlayerScore } from '~/routes/game/singing/post-game/post-game-view';

interface Props {
  players: PlayerScore[];
  /** 0–1 through the song. The same value the leaderboard rows count up against. */
  progress: number;
  /** Co-op draws its one merged team line in white — there is no player to colour it after. */
  useColors?: boolean;
  /** Pixel height to take instead of the default. Online has no camera roll beside it, so the chart
   * is sized to the top two leaderboard rows rather than leaving the column half empty. */
  height?: number;
}

/** The chart is drawn in its own square space and stretched to whatever box it lands in;
 * `vector-effect: non-scaling-stroke` keeps the lines an even thickness through that stretch. */
const VIEWBOX = 100;
/** Keeps the flat start and the winning line's peak off the very edge of the box. */
const PADDING = 4;

interface Point {
  x: number;
  y: number;
}

interface Line {
  playerNumber: number;
  color: string;
  points: Point[];
}

function buildLines(players: PlayerScore[], useColors: boolean): Line[] {
  const totals = players.map((player) => sumDetailedScore(player.detailedScore[0]));
  // One shared scale, so the lines keep the gaps the leaderboard shows rather than each filling the
  // box. `|| 1` guards a scoreless round, where every line is flat along the bottom.
  const highest = Math.max(...totals, 1);

  const toY = (score: number) => VIEWBOX - PADDING - (score / highest) * (VIEWBOX - PADDING * 2);

  return players.map((player, index) => {
    const timeline = player.scoreTimeline;
    // Without a timeline (online) there is only the total to draw: a straight climb to it.
    const scores = timeline?.length ? timeline.map(sumDetailedScore) : [0, totals[index] ?? 0];

    return {
      playerNumber: player.playerNumber,
      color: useColors ? styles.colors.players[player.playerNumber].text : 'white',
      points: scores.map((score, sample) => ({
        x: (sample / (scores.length - 1)) * VIEWBOX,
        y: toY(score),
      })),
    };
  });
}

/** The part of a line drawn so far, ending part-way between two samples so the head of the line
 * moves every frame rather than hopping from sample to sample. */
function pointsUpTo(points: Point[], progress: number): string {
  const position = Math.max(0, Math.min(1, progress)) * (points.length - 1);
  const lastWhole = Math.floor(position);

  const drawn = points.slice(0, lastWhole + 1);
  const remainder = position - lastWhole;
  if (remainder > 0 && lastWhole + 1 < points.length) {
    const from = points[lastWhole];
    const to = points[lastWhole + 1];
    drawn.push({ x: from.x + (to.x - from.x) * remainder, y: from.y + (to.y - from.y) * remainder });
  }

  return drawn.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
}

/** Every player's score as it climbed through the song, drawing itself in step with the reveal. */
function ScoreChart({ players, progress, useColors = true, height }: Props) {
  const lines = useMemo(() => buildLines(players, useColors), [players, useColors]);

  return (
    <Box
      className="h-28 w-full shrink-0 items-stretch justify-start gap-1 p-3 transition-[height] duration-300 md:h-36 2xl:h-48"
      style={height ? { height } : undefined}
      data-test="score-chart">
      <Typography as="div" className="text-inactive text-xs 2xl:text-sm">
        Player scores over time
      </Typography>
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        preserveAspectRatio="none"
        // `min-h-0` so the plot gives up height to the header above it rather than overflowing the box.
        className="min-h-0 w-full flex-1 overflow-visible"
        aria-hidden="true">
        {lines.map((line) => (
          <polyline
            key={line.playerNumber}
            points={pointsUpTo(line.points, progress)}
            fill="none"
            stroke={line.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </Box>
  );
}

export default ScoreChart;
