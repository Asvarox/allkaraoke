import { ComponentProps } from 'react';

import events from '~/modules/game-events/game-events';
import { useEventListener, useEventListenerSelector } from '~/modules/game-events/hooks';
import useMicMonitoring from '~/modules/hooks/use-mic-monitoring';
import { LOCAL_PLAYER_NUMBERS } from '~/modules/players/player-number';
import PlayersManager from '~/modules/players/players-manager';
import MicCheckSlot from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot';
import NoiseDetection from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/noise-detection';

export default function MicCheck(props: ComponentProps<'div'>) {
  // Force update when the name changes
  useEventListener(events.playerNameChanged);

  useMicMonitoring();

  const inputs = useEventListenerSelector(events.playerInputChanged, () => PlayersManager.getInputs());
  const isSetup = inputs.some((input) => input.source !== 'Dummy');
  const players = PlayersManager.getPlayers();

  return (
    <div {...props} className={`typography flex flex-col gap-3 text-2xl ${props.className ?? ''}`}>
      <div className="relative grid w-full grid-cols-2 gap-3 md:grid-cols-1">
        {!isSetup && (
          <div className="absolute -inset-2 z-1 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/35 text-center text-white">
            <span className="text-lg font-semibold">Microphones are not set up yet</span>
            <span className="text-base opacity-75">
              Go to <strong>Setup Mics</strong> on the right
            </span>
          </div>
        )}
        <div className="absolute right-0 bottom-full left-0 z-30">
          <NoiseDetection />
        </div>
        {LOCAL_PLAYER_NUMBERS.map((i) => (
          <MicCheckSlot key={i} playerIndex={i} player={players.find((p) => p.number === i)} />
        ))}
      </div>
    </div>
  );
}
