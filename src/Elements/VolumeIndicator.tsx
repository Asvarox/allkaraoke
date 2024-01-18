import styled from '@emotion/styled';
import PlayersManager from 'Players/PlayersManager';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { usePlayerMicData } from 'hooks/players/usePlayerMic';
import { ForwardedRef, forwardRef, useCallback, useMemo, useState } from 'react';
import tinycolor from 'tinycolor2';

const usePlayerColor = (playerNumber: 0 | 1 | 2 | 3) => {
  return useMemo(() => {
    if (!styles.colors.players[playerNumber]) return '0, 0, 0';
    const rgb = tinycolor(styles.colors.players[playerNumber].text).toRgb();
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  }, [playerNumber]);
};

const VolumeIndicatorBase = styled.div<{ color: string }>`
  background: linear-gradient(270deg, rgba(${(props) => props.color}, 1) 0%, rgba(${(props) => props.color}, 0) 100%);
  height: 100%;
  width: 100%;
  position: absolute;
  right: 0;
  top: 0;
  background-repeat: repeat-y;
  transform-origin: right;
  z-index: 1;
  pointer-events: none;
`;

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

    return <VolumeIndicatorBase color={color} {...rest} style={{ transform: `scaleX(${percent})` }} ref={ref} />;
  },
);

export const PlayerMicCheck = ({ playerNumber, ...props }: { playerNumber: 0 | 1 | 2 | 3 }) => {
  const [elem, setElem] = useState<HTMLDivElement | null>();

  const cb = useCallback(
    ([volume]: [number, number]) => {
      if (elem) {
        const percent = `${Math.min(1, volume * 20)}`;

        elem.style.transform = `scaleX(${percent})`;
      }
    },
    [elem],
  );

  usePlayerMicData(playerNumber, cb);
  const color = usePlayerColor(playerNumber);

  return <VolumeIndicatorBase {...props} color={color} ref={setElem} />;
};
