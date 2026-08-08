import styles from '~/modules/game-engine/drawing/styles';
import { PlayerNumber } from '~/modules/players/player-number';
import { cn } from '~/utils/cn';

interface Props {
  /** `null` renders the "nobody yet" grey, for seats that can legitimately be unassigned (a remote
   * mic that hasn't joined the game). */
  number: PlayerNumber | null;
  /**
   * Which of the player's colors to paint with. `text` is the canonical one — it is what the lyrics,
   * the results screen and every other "this is player N" affordance use. `fill` reads the note-fill
   * color (`perfect.fill`) instead, for callers that mean the notes specifically. Both are the
   * player's base color at full alpha and resolve to the same string today, so the choice states
   * intent rather than changing what you see.
   */
  variant?: 'text' | 'fill';
  className?: string;
}

/** Who a row belongs to, in the same color their notes and lyrics use — for the lists where the
 * volume bar can't carry that on its own (a silent singer has no bar to show). Sized in `em` so it
 * scales with whatever text it sits beside. */
export function PlayerColorDot({ number, variant = 'text', className }: Props) {
  const playerColors = number === null ? null : styles.colors.players[number];
  const color =
    playerColors === null
      ? styles.colors.text.inactive
      : variant === 'text'
        ? playerColors.text
        : playerColors.perfect.fill;

  return (
    <span
      className={cn('relative inline-block aspect-square h-[1em] w-[1em] shrink-0 rounded-full', className)}
      style={{ background: color }}
    />
  );
}
