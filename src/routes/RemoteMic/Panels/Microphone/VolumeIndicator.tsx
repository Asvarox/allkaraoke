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
    playerNumber !== null ? styles.colors.players[playerNumber].hit.fill : styles.colors.lines.normal.fill;

  return (
    <IndicatorContainer
      className="rounded-md"
      data-is-mic-on={isMicOn}
      color={backgroundColor}
      data-player-number={`${playerNumber ?? 'none'}`}
      data-test="indicator">
      {isMicOn && (
        <>
          <Debug>{frequency ? `${Math.round(frequency)}Hz` : ' '}</Debug>
        </>
      )}
      {isConnected && permissions === 'write' && <PlayerChange playerNumber={playerNumber} />}
      <Indicator style={{ transform: `scaleY(${isMicOn ? 1 - Math.min(1, volume / maxVolume) : 1})` }} />
    </IndicatorContainer>
  );
}

const Debug = styled.span`
  position: absolute;
  color: white;
  opacity: 0.125;
`;

const Indicator = styled.div`
  width: 100%;
  min-height: 200px;
  max-height: 100vw;
  background-color: rgba(0, 0, 0, 0.25);
  transition: 200ms;
  transform-origin: top;
`;

const IndicatorContainer = styled.div<{ color: string }>`
  position: relative;
  border: 0.1rem solid white;
  flex: 1;
  min-height: 200px;
  max-height: 100vw;
  transition: 300ms;

  background: ${(props) => props.color};
`;
