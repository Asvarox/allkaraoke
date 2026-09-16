import { motion } from 'motion/react';
import CountUp from 'react-countup';

import Box from '~/modules/elements/akui/primitives/box';
import { PlayerColorDot } from '~/modules/elements/player-color-dot';
import { useLiveOnlineLeaderboard } from '~/modules/online/client/live-leaderboard';
import OnlineClient from '~/modules/online/client/online-client';
import { formatScore } from '~/modules/online/format-score';

/** The live leaderboard. Other singers' scores arrive throttled from the room, and CountUp plus the
 * layout animation smooth them out; your own comes from your own game, so it moves as you sing
 * (see `useLiveOnlineLeaderboard`). */
function LeaderboardOverlay() {
  const leaderboard = useLiveOnlineLeaderboard();
  const selfId = OnlineClient.getParticipantId();

  if (!leaderboard.length) return null;

  return (
    <Box
      className="z-hud pointer-events-none fixed top-24 right-4 items-stretch gap-1 rounded-lg p-3"
      data-test="online-leaderboard">
      {leaderboard.map((entry, index) => {
        const isSelf = entry.participantId === selfId;
        return (
          <motion.div
            layout
            transition={{ duration: 0.3 }}
            key={entry.participantId}
            className="typography text-md flex items-center gap-2"
            data-test={`online-leaderboard-entry-${entry.playerNumber}`}
            data-self={isSelf || undefined}>
            <span className="w-6 text-right">{index + 1}.</span>
            <PlayerColorDot number={entry.playerNumber} />
            <span className="max-w-40 truncate">{entry.name}</span>
            <span className="text-active ml-auto pl-3" data-test="online-leaderboard-score">
              {isSelf ? (
                // Not eased: it already updates continuously, and a count-up would chase it from
                // most of a second behind — the lag this row exists to remove.
                formatScore(entry.score)
              ) : (
                <CountUp end={entry.score} duration={0.7} preserveValue formattingFn={formatScore} />
              )}
            </span>
          </motion.div>
        );
      })}
    </Box>
  );
}

export default LeaderboardOverlay;
