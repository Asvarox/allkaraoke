import { motion } from 'motion/react';
import CountUp from 'react-countup';

import Box from '~/modules/elements/akui/primitives/box';
import { PlayerColorDot } from '~/modules/elements/player-color-dot';
import { useOnlineLeaderboard } from '~/modules/online/client/hooks';
import { formatScore } from '~/modules/online/format-score';

/** Presentational live leaderboard rendered from room score snapshots — does not touch GameState.
 * Score updates arrive throttled from the server; CountUp + layout animations smooth them out. */
function LeaderboardOverlay() {
  const leaderboard = useOnlineLeaderboard();

  if (!leaderboard.length) return null;

  return (
    <Box
      className="z-hud pointer-events-none fixed top-24 right-4 items-stretch gap-1 rounded-lg p-3"
      data-test="online-leaderboard">
      {leaderboard.map((entry, index) => (
        <motion.div
          layout
          transition={{ duration: 0.3 }}
          key={entry.participantId}
          className="typography text-md flex items-center gap-2"
          data-test={`online-leaderboard-entry-${entry.playerNumber}`}>
          <span className="w-6 text-right">{index + 1}.</span>
          <PlayerColorDot number={entry.playerNumber} />
          <span className="max-w-40 truncate">{entry.name}</span>
          <span className="text-active ml-auto pl-3" data-test="online-leaderboard-score">
            <CountUp end={entry.score} duration={0.7} preserveValue formattingFn={formatScore} />
          </span>
        </motion.div>
      ))}
    </Box>
  );
}

export default LeaderboardOverlay;
