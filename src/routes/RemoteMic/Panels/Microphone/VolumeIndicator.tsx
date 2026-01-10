import styles from 'modules/GameEngine/Drawing/styles';
import { useEffect, useState } from 'react';
import { twc } from 'react-twc';
import PlayerChange from 'routes/RemoteMic/Panels/Microphone/PlayerChange';
import usePermissions from 'routes/RemoteMic/hooks/usePermissions';

interface Props {
  volume: number;
  playerNumber: 0 | 1 | 2 | 3 | null;
  frequency: number | null;
  isMicOn: boolean;
  isConnected: boolean;
  showPlayerChangeModal?: boolean;
}

export default function VolumeIndicator({
  playerNumber,
  volume,
  frequency,
  isMicOn,
  isConnected,
  showPlayerChangeModal,
}: Props) {
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
      style={{ background: backgroundColor }}
      data-player-number={`${playerNumber ?? 'none'}`}
      data-test="indicator">
      {isMicOn && (
        <>
          <Debug>{frequency ? `${Math.round(frequency)}Hz` : ' '}</Debug>
        </>
      )}
      {isConnected && permissions === 'write' && (
        <PlayerChange playerNumber={playerNumber} defaultOpen={showPlayerChangeModal} />
      )}
      <Indicator style={{ transform: `scaleY(${isMicOn ? 1 - Math.min(1, volume / maxVolume) : 1})` }} />
    </IndicatorContainer>
  );
}

const Debug = twc.span`absolute text-white opacity-[0.125]`;

const Indicator = twc.div`w-full min-h-[200px] max-h-[300px] bg-black/25 transition-[200ms] origin-top`;

const IndicatorContainer = twc.div`
  relative border-[1px] border-white flex-1 min-h-[200px] max-h-[300px] transition-[300ms]
`;
