import { ComponentProps, ForwardedRef, forwardRef, useCallback, useMemo, useRef } from 'react';
import tinycolor from 'tinycolor2';
import styles from '~/modules/GameEngine/Drawing/styles';
import PlayersManager from '~/modules/Players/PlayersManager';
import { usePlayerMicData } from '~/modules/hooks/players/usePlayerMic';
import { twx } from '~/utils/twx';

const usePlayerColor = (playerNumber: 0 | 1 | 2 | 3) => {
  return useMemo(() => {
    if (!styles.colors.players[playerNumber]) return '0, 0, 0';
    const rgb = tinycolor(styles.colors.players[playerNumber].text).toRgb();
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  }, [playerNumber]);
};

const VolumeIndicatorBase = twx.div`pointer-events-none absolute top-0 right-0 z-1 h-full w-full origin-right bg-repeat-y`;

interface Props {
  playerNumber: 0 | 1 | 2 | 3;
  volume: number;
}

export const VolumeIndicator = forwardRef(
  ({ volume, playerNumber, ...rest }: Props, ref: ForwardedRef<HTMLDivElement | null>) => {
    const percent = `${Math.min(1, volume * 20)}`;
    const color = usePlayerColor(playerNumber);

    const player = PlayersManager.getPlayer(playerNumber);
    if (!player) return null;

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
}: { playerNumber: 0 | 1 | 2 | 3 } & ComponentProps<typeof VolumeIndicatorBase>) => {
  const elemRef = useRef<HTMLDivElement | null>(null);

  const cb = useCallback(([volume]: [number, number]) => {
    if (elemRef.current) {
      const percent = `${Math.min(1, volume * 20)}`;

      elemRef.current.style.transform = `scaleX(${percent})`;
    }
  }, []);

  usePlayerMicData(playerNumber, cb);
  const color = usePlayerColor(playerNumber);

  return (
    <VolumeIndicatorBase
      {...props}
      ref={elemRef}
      style={{
        background: `linear-gradient(270deg, rgba(${color}, 1) 0%, rgba(${color}, 0) 100%)`,
      }}
    />
  );
};
