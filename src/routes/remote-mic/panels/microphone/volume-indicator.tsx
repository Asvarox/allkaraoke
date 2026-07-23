import { useEffect, useState } from 'react';
import { twc } from 'react-twc';

import styles from '~/modules/game-engine/drawing/styles';
import usePermissions from '~/routes/remote-mic/hooks/use-permissions';
import PlayerChange from '~/routes/remote-mic/panels/microphone/player-change';

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
      style={{ background: backgroundColor }}
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

const Debug = twc.span`absolute text-white opacity-[0.125]`;

const Indicator = twc.div`h-full min-h-0 w-full origin-top bg-black/25 transition-[200ms]`;

// A compact strip in portrait — tall enough for the pinned "Join game"/color button — so the mirrored
// keyboard gets as much room as possible. In landscape there's height to spare beside the keyboard, so
// it expands back to the full 200–300px preview. The `scaleY` volume viz animates within it either way.
const IndicatorContainer = twc.div`relative h-[6.5rem] min-h-[6.5rem] w-full border-[1px] border-white transition-[300ms] landscape:h-auto landscape:max-h-[300px] landscape:min-h-[200px] landscape:flex-1`;
