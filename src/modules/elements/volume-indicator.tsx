import { ComponentProps, ForwardedRef, forwardRef, useCallback, useMemo, useRef } from 'react';
import tinycolor from 'tinycolor2';

import styles from '~/modules/game-engine/drawing/styles';
import { usePlayerMicData } from '~/modules/hooks/players/use-player-mic';
import { PlayerNumber } from '~/modules/players/player-number';
import { twx } from '~/utils/twx';

const usePlayerColor = (playerNumber: PlayerNumber) => {
  return useMemo(() => {
    if (!styles.colors.players[playerNumber]) return '0, 0, 0';
    const rgb = tinycolor(styles.colors.players[playerNumber].text).toRgb();
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  }, [playerNumber]);
};

const VolumeIndicatorBase = twx.div`pointer-events-none absolute top-0 right-0 z-1 h-full w-full origin-right overflow-hidden bg-repeat-y`;

interface Props extends ComponentProps<typeof VolumeIndicatorBase> {
  playerNumber: PlayerNumber;
  volume: number;
}

/**
 * Volume bar driven by an explicitly supplied level, for singers whose audio isn't on this device
 * (online rooms report their own volume). For local mics use `PlayerMicCheck` instead.
 */
export const VolumeIndicator = forwardRef(
  ({ volume, playerNumber, ...rest }: Props, ref: ForwardedRef<HTMLDivElement | null>) => {
    const percent = `${Math.min(1, volume * 20)}`;
    const color = usePlayerColor(playerNumber);

    return (
      <VolumeIndicatorBase
        // color={color}
        {...rest}
        style={{
          transform: `scaleX(${percent})`,
          background: `linear-gradient(270deg, rgba(${color}, 1) 0%, rgba(${color}, 0) 100%)`,
        }}
        ref={ref}
      />
    );
  },
);

export const PlayerMicCheck = ({
  playerNumber,
  ...props
}: { playerNumber: PlayerNumber } & ComponentProps<typeof VolumeIndicatorBase>) => {
  const elemRef = useRef<HTMLDivElement | null>(null);

  const cb = useCallback(([volume]: [number, number]) => {
    if (elemRef.current) {
      const percent = `${Math.round(Math.min(1, volume * 20) * 100) / 100}`;

      elemRef.current.style.transform = `scaleX(${percent})`;
    }
  }, []);

  usePlayerMicData(playerNumber, cb);
  const color = usePlayerColor(playerNumber);

  return (
    <VolumeIndicatorBase {...props} data-test="mic-volume-indicator">
      <div
        className="h-full w-full origin-right"
        ref={elemRef}
        style={{
          background: `linear-gradient(270deg, rgba(${color}, 1) 0%, rgba(${color}, 0) 100%)`,
        }}
      />
    </VolumeIndicatorBase>
  );
};
