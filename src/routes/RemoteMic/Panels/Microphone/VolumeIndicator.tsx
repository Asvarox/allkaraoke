import styled from '@emotion/styled';
import styles from 'modules/GameEngine/Drawing/styles';
import { useEffect, useState } from 'react';
import PlayerChange from 'routes/RemoteMic/Panels/Microphone/PlayerChange';
import usePermissions from 'routes/RemoteMic/hooks/usePermissions';

interface Props {
  volume: number;
  playerNumber: 0 | 1 | 2 | 3 | null;
  frequency: number | null;
  isMicOn: boolean;
  isConnected: boolean;
}

export default function VolumeIndicator({ playerNumber, volume, frequency, isMicOn, isConnected }: Props) {
  const [maxVolume, setMaxVolume] = useState(0.000001);
  const permissions = usePermissions();

  useEffect(() => {
    setMaxVolume((current) => (volume > current ? volume : current * 0.99));
  }, [volume]);

  const backgroundColor =
    playerNumber !== null ? styles.colors.players[playerNumber].miss.stroke : styles.colors.lines.normal.fill;
  const indicatorColor =
    playerNumber !== null ? styles.colors.players[playerNumber].perfect.fill : styles.colors.lines.normal.fill;

  return (
    <IndicatorContainer
      isMicOn={isMicOn}
      color={backgroundColor}
      data-player-number={`${playerNumber ?? 'none'}`}
      data-test="indicator">
      {isMicOn && (
        <>
          <Debug>
            {frequency ? `${Math.round(frequency)}Hz` : ' '}
            <br />
            {String(volume * 100).slice(0, 5)}
          </Debug>
        </>
      )}
      {isConnected && permissions === 'write' && <PlayerChange playerNumber={playerNumber} />}
      <Indicator
        color={indicatorColor}
        style={{ transform: `scaleY(${isMicOn ? 1 - Math.min(1, volume / maxVolume) : 1})` }}
      />
    </IndicatorContainer>
  );
}

const Debug = styled.span`
  position: absolute;
  color: white;
  opacity: 0.125;
`;

const Indicator = styled.div<{ color: string }>`
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.color};
  transition: 200ms;
  transform-origin: top;
`;

const IndicatorContainer = styled.div<{ color: string; isMicOn: boolean }>`
  position: relative;
  border: 0.1rem solid white;
  flex: 1;
  min-height: 200px;
  max-height: 100vw;
  transition: 300ms;

  background: ${(props) => props.color};
`;
