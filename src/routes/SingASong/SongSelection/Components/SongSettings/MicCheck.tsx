import { ComponentProps, useEffect } from 'react';
import InputManager from '~/modules/GameEngine/Input/InputManager';
import events from '~/modules/GameEvents/GameEvents';
import { useEventListener, useEventListenerSelector } from '~/modules/GameEvents/hooks';
import PlayersManager from '~/modules/Players/PlayersManager';
import MicCheckSlot from '~/routes/SingASong/SongSelection/Components/SongSettings/MicCheck/MicCheckSlot';
import NoiseDetection from '~/routes/SingASong/SongSelection/Components/SongSettings/MicCheck/NoiseDetection';

export default function MicCheck(props: ComponentProps<'div'>) {
  // Force update when the name changes
  useEventListener(events.playerNameChanged);

  useEffect(() => {
    InputManager.startMonitoring();
  }, []);

  const inputs = useEventListenerSelector(events.playerInputChanged, () => PlayersManager.getInputs());
  const isSetup = inputs.some((input) => input.source !== 'Dummy');
  const players = PlayersManager.getPlayers();

  return (
    <div {...props} className={`typography flex flex-col gap-3 text-2xl ${props.className ?? ''}`}>
      <div className="relative grid w-full grid-cols-2 gap-3 md:grid-cols-1">
        <div className="absolute right-0 bottom-full left-0 z-30">
          <NoiseDetection />
        </div>
        {([0, 1, 2, 3] as const).map((i) => (
          <MicCheckSlot key={i} playerIndex={i} player={players.find((p) => p.number === i)} />
        ))}
        {!isSetup && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/80 text-center text-white">
            <span className="text-lg font-semibold">Microphones are not set up yet</span>
            <span className="text-base opacity-75">You can set them up in the next step</span>
          </div>
        )}
      </div>
    </div>
  );
}
