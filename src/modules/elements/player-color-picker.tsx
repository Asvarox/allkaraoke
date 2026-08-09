import { PropsWithChildren } from 'react';

import { Button } from '~/modules/elements/akui/button';
import { backgroundTheme } from '~/modules/elements/layout-with-background';
import { PLAYER_COLOR_NAMES } from '~/modules/game-engine/drawing/player-colors';
import styles from '~/modules/game-engine/drawing/styles';
import { PlayerNumber } from '~/modules/players/player-number';

interface Props {
  /**
   * Theme the color names are read from. Injected rather than read from settings because the two
   * callers learn it differently: the lobby reads `BackgroundThemeSetting` directly, while the
   * remote mic only knows the theme the phone was told over the wire (`useSubscription('style')`).
   */
  theme: backgroundTheme;
  /** Which colors to offer — local play caps at MAX_PLAYERS, online offers all six. */
  playerNumbers: PlayerNumber[];
  /** The color the current user already holds, labelled "(You)". */
  selected: PlayerNumber | null;
  /** Name of whoever *else* holds a color, by player number. */
  occupants: Partial<Record<PlayerNumber, string>>;
  /** Taking a color that is still free (or, unless `disableOccupied`, stealing an occupied one). */
  onPick: (playerNumber: PlayerNumber) => void;
  /** Clicking the color you already hold. Online has nothing to do; the remote mic closes the modal. */
  onPickSelected?: () => void;
  /** Online only — a color someone else holds can't be taken. The remote mic lets you steal one. */
  disableOccupied?: boolean;
}

/** The list of player colors to pick from, each button painted in the color it offers and labelled
 * with whoever holds it. Shared by the online lobby's customize modal and the remote mic's player
 * change modal — the same list of the same seats, reached from two different screens. `children`
 * are extra controls (unassign, close) stacked under the colors in the same column. */
export function PlayerColorPicker({
  theme,
  playerNumbers,
  selected,
  occupants,
  onPick,
  onPickSelected,
  disableOccupied = false,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="flex flex-col gap-2 pb-2">
      {playerNumbers.map((number) => {
        const occupant = occupants[number];
        const isOwn = number === selected;

        return (
          <Button
            key={number}
            size="small"
            data-test={`player-color-${number}`}
            data-selected={isOwn}
            data-focused={isOwn}
            onClick={isOwn ? onPickSelected : () => onPick(number)}
            disabled={disableOccupied && !!occupant}
            className="gap-2"
            style={{ color: styles.colors.players[number].perfect.fill }}>
            {PLAYER_COLOR_NAMES[theme][number]}
            {(isOwn || occupant) && (
              <span className="text-sm text-gray-300" data-test="player-color-occupant">
                ({isOwn ? 'You' : occupant})
              </span>
            )}
          </Button>
        );
      })}
      {children}
    </div>
  );
}
