import styles from '~/modules/game-engine/drawing/styles';
import { PlayerNumber } from '~/modules/players/player-number';
import { cn } from '~/utils/cn';

interface Props {
  playerNumber: PlayerNumber;
  className?: string;
}

/** Who a row belongs to, in the same color their notes and lyrics use — for the lists where the
 * volume bar can't carry that on its own (a silent singer has no bar to show). */
export function PlayerColorDot({ playerNumber, className }: Props) {
  return (
    <span
      className={cn('relative inline-block h-3 w-3 shrink-0 rounded-full', className)}
      style={{ background: styles.colors.players[playerNumber].text }}
    />
  );
}
