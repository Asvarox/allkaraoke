import { styled } from '@linaria/react';
import { typography } from 'modules/Elements/cssMixins';
import InputManager from 'modules/GameEngine/Input/InputManager';
import events from 'modules/GameEvents/GameEvents';
import { useEventListener, useEventListenerSelector } from 'modules/GameEvents/hooks';
import PlayersManager from 'modules/Players/PlayersManager';
import { ComponentProps, useEffect } from 'react';
import NoiseDetection from 'routes/SingASong/SongSelection/Components/SongSettings/MicCheck/NoiseDetection';
import SinglePlayer from 'routes/SingASong/SongSelection/Components/SongSettings/MicCheck/SinglePlayer';

export default function MicCheck(props: ComponentProps<typeof Container>) {
  // Force update when the name changes
  useEventListener(events.playerNameChanged);

  useEffect(() => {
    InputManager.startMonitoring();
  }, []);

  const inputs = useEventListenerSelector(events.playerInputChanged, () => PlayersManager.getInputs());
  const isSetup = inputs.some((input) => input.source !== 'Dummy');

  return (
    <Container {...props}>
      <MicChecksContainer>
        Microphone Check
        {isSetup ? (
          PlayersManager.getPlayers().map((player) => <SinglePlayer key={player.number} player={player} />)
        ) : (
          <>
            <Indicator>Mic not setup</Indicator>
            <h4>Singing will be emulated</h4>
            <h5>You can setup in the Next step</h5>
          </>
        )}
      </MicChecksContainer>
      <NoiseDetection />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  font-size: 3rem;
  ${typography};
  margin-bottom: 8.6rem;
  gap: 3.5rem;
`;

const MicChecksContainer = styled.div`
  gap: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Indicator = styled.div`
  position: relative;
  border: 0.1rem solid white;
  padding: 1rem 3rem;
  background: black;
  width: 80%;

  text-align: center;
  gap: 1.25rem;
  font-size: 2.3rem;
  color: white;
`;
