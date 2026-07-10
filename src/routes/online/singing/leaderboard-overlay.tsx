import { motion } from 'motion/react';
import CountUp from 'react-countup';
import styles from '~/modules/game-engine/drawing/styles';
import { useOnlineLeaderboard } from '~/modules/online/client/hooks';

const formatScore = (score: number) => Math.max(0, Math.floor(score)).toLocaleString('en');

/** Presentational live leaderboard rendered from room score snapshots — does not touch GameState.
 * Score updates arrive throttled from the server; CountUp + layout animations smooth them out. */
function LeaderboardOverlay() {
  const leaderboard = useOnlineLeaderboard();

  if (!leaderboard.length) return null;

  return (
    <div
      className="pointer-events-none fixed top-24 right-4 z-30 flex flex-col gap-1 rounded-lg bg-black/50 p-3"
      data-test="online-leaderboard">
      {leaderboard.map((entry, index) => (
        <motion.div
          layout
          transition={{ duration: 0.3 }}
          key={entry.participantId}
          className="typography flex items-center gap-2 text-base"
          data-test={`online-leaderboard-entry-${entry.playerNumber}`}>
          <span className="w-6 text-right">{index + 1}.</span>
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: styles.colors.players[entry.playerNumber].text }}
          />
          <span className="max-w-40 truncate">{entry.name}</span>
          <span className="text-active ml-auto pl-3" data-test="online-leaderboard-score">
            <CountUp end={entry.score} duration={0.7} preserveValue formattingFn={formatScore} />
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default LeaderboardOverlay;
