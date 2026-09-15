import { motion } from 'motion/react';

import { DetailedScore } from '~/interfaces';
import { Chip } from '~/modules/elements/akui/chip';
import Box from '~/modules/elements/akui/primitives/box';
import { Typography } from '~/modules/elements/akui/primitives/typography';
import styles from '~/modules/game-engine/drawing/styles';
import { PlayerNumber } from '~/modules/players/player-number';
import { formatter } from '~/routes/game/singing/game-overlay/components/score-text';
import { PlayerScore } from '~/routes/game/singing/post-game/post-game-view';
import PlayerDetailedScore from '~/routes/game/singing/post-game/views/results/player-detailed-score';
import { cn } from '~/utils/cn';

interface Props {
  player: PlayerScore;
  rank: number;
  /** Total reached so far — `revealed` summed up, passed in because the list sorts by it. */
  score: number;
  /** The breakdown behind `score`, for the bars. */
  revealed: DetailedScore;
  isWinner: boolean;
  useColors?: boolean;
  playerNumber: PlayerNumber;
}

/** Rank, name and score share one size so the row reads as a single line; the winner's steps up a
 * notch once it is called. Sizes come from the AKUI scale rather than arbitrary values. */
const rowTextSize = (isWinner: boolean) =>
  cn('text-lg font-bold 2xl:text-2xl', isWinner ? 'sm:text-2xl 2xl:text-3xl' : '');

function PlayerScoreView({ playerNumber, player, rank, score, revealed, isWinner, useColors = true }: Props) {
  const nameColor = useColors ? { color: styles.colors.players[playerNumber].text } : undefined;

  return (
    <Box className={cn('relative w-full gap-2 px-3 py-2', isWinner ? 'subtle-focus' : '')}>
      <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1">
        <Typography style={nameColor} className={rowTextSize(isWinner)}>
          {rank}
        </Typography>
        <Typography
          style={nameColor}
          data-test={`player-${playerNumber}-name`}
          className={cn('ph-no-capture min-w-0 flex-1 truncate', rowTextSize(isWinner))}>
          {player.name}
        </Typography>
        <div className="ml-auto flex items-center">
          <Typography
            data-test={`player-${playerNumber}-score`}
            data-score={Math.floor(score)}
            className={rowTextSize(isWinner)}>
            {/* Counts up on its own because `score` is re-read every frame of the reveal — a
                tweening component here would chase a target that has already moved. */}
            {formatter.format(Math.floor(score))}
          </Typography>
          {/* Two wrappers doing two jobs. The outer one grows from zero width, so the score beside it
              slides over to make room instead of jumping the moment the badge mounts — the gap is an
              animated margin rather than the row's `gap`, which would snap open at full size. The
              inner one slides the badge in from the right, clipped by the outer's `overflow-hidden`
              until there is room for it. Wrapping rather than animating `Chip` itself: `motion.create`
              would need it to forward a ref. */}
          {isWinner && (
            <motion.div
              initial={{ width: 0, marginLeft: 0 }}
              animate={{ width: 'auto', marginLeft: 8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="inline-flex overflow-hidden">
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="inline-flex">
                <Chip variant="orange" className="whitespace-nowrap">
                  Winner
                </Chip>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
      <PlayerDetailedScore playerNumber={playerNumber} player={player} revealed={revealed} showLabels={rank === 1} />
    </Box>
  );
}

export default PlayerScoreView;
