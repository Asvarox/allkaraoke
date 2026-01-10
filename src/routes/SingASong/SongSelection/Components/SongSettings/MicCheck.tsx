import InputManager from 'modules/GameEngine/Input/InputManager';
import events from 'modules/GameEvents/GameEvents';
import { useEventListener, useEventListenerSelector } from 'modules/GameEvents/hooks';
import PlayersManager from 'modules/Players/PlayersManager';
import { ComponentProps, useEffect } from 'react';
import NoiseDetection from 'routes/SingASong/SongSelection/Components/SongSettings/MicCheck/NoiseDetection';
import SinglePlayer from 'routes/SingASong/SongSelection/Components/SongSettings/MicCheck/SinglePlayer';

export default function MicCheck(props: ComponentProps<'div'>) {
  // Force update when the name changes
  useEventListener(events.playerNameChanged);

  useEffect(() => {
    InputManager.startMonitoring();
  }, []);

  const inputs = useEventListenerSelector(events.playerInputChanged, () => PlayersManager.getInputs());
  const isSetup = inputs.some((input) => input.source !== 'Dummy');

  return (
    <div {...props} className={`typography mobile:hidden mb-20 flex gap-8 text-2xl ${props.className ?? ''}`}>
      <div className="flex flex-col items-center gap-3">
        Microphone Check
        {isSetup ? (
          PlayersManager.getPlayers().map((player) => <SinglePlayer key={player.number} player={player} />)
        ) : (
          <>
            <div className="relative w-4/5 gap-3 border border-white bg-black px-12 py-2 text-center text-lg text-white">
              Mic not setup
            </div>
            <span className={`mobile:text-sm text-lg`}>Singing will be emulated</span>
            <span className={`mobile:text-sm text-lg`}>You can setup in the Next step</span>
          </>
        )}
      </div>
      <NoiseDetection />
    </div>
  );
}
