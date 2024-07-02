import { styled } from '@linaria/react';
import { PlayerSetup, SingSetup, SongPreview } from 'interfaces';
import events from 'modules/GameEvents/GameEvents';
import { useState } from 'react';
import GameSettings from 'routes/SingASong/SongSelection/Components/SongSettings/GameSettings';
import MicCheck from 'routes/SingASong/SongSelection/Components/SongSettings/MicCheck';
import PlayerSettings from 'routes/SingASong/SongSelection/Components/SongSettings/PlayerSettings';

interface Props {
  songPreview: SongPreview;
  onPlay: (setup: SingSetup & { song: SongPreview }) => void;
  keyboardControl: boolean;
  onExitKeyboardControl: () => void;
}

export default function SongSettings({ songPreview, onPlay, keyboardControl, onExitKeyboardControl }: Props) {
  const [singSetup, setSingSetup] = useState<SingSetup | null>(null);
  const [step, setStep] = useState<'song' | 'players'>('song');

  const onSongStepFinish = (setup: SingSetup) => {
    setSingSetup(setup);
    setStep('players');
  };
  const startSong = (players: PlayerSetup[]) => {
    if (!singSetup) return;
    const finalSetup = {
      ...singSetup,
      players: players,
    };
    events.songStarted.dispatch(songPreview, finalSetup);
    onPlay({ song: songPreview, ...finalSetup });
  };
  return (
    <Container>
      <MicCheck style={step === 'players' ? { viewTransitionName: 'player-mic-check-container' } : undefined} />
      <GameConfiguration>
        {step === 'song' && (
          <GameSettings
            songPreview={songPreview}
            onNextStep={onSongStepFinish}
            keyboardControl={keyboardControl}
            onExitKeyboardControl={onExitKeyboardControl}
          />
        )}
        {step === 'players' && (
          <PlayerSettings
            songPreview={songPreview}
            onNextStep={startSong}
            keyboardControl={keyboardControl}
            onExitKeyboardControl={() => setStep('song')}
          />
        )}
      </GameConfiguration>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;

  hr {
    margin: 1rem;
    opacity: 0.25;
  }
`;

const GameConfiguration = styled.div`
  width: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1.25rem;
`;
