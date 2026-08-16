import styles from '~/modules/game-engine/drawing/styles';
import { PlayerNumber } from '~/modules/players/player-number';
import { cn } from '~/utils/cn';

interface Props {
  /** `null` renders the "nobody yet" grey, for seats that can legitimately be unassigned (a remote
   * mic that hasn't joined the game). */
  number: PlayerNumber | null;
  className?: string;
}

/** Who a row belongs to, in the same color their notes and lyrics use — for the lists where the
 * volume bar can't carry that on its own (a silent singer has no bar to show). Sized in `em` so it
 * scales with whatever text it sits beside. */
export function PlayerColorDot({ number, className }: Props) {
  const color = number === null ? styles.colors.text.inactive : styles.colors.players[number].text;

  return (
    <span
      className={cn('relative inline-block aspect-square h-[1em] w-[1em] shrink-0 rounded-full', className)}
      style={{ background: color }}
    />
  );
}
