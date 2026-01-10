import styled from '@emotion/styled';
import { PlayerSetup, SingSetup, SongPreview } from 'interfaces';
import { mobileMQ } from 'modules/Elements/cssMixins';
import events from 'modules/GameEvents/GameEvents';
import { AnimatePresence, motion } from 'motion/react';
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
      <MicCheck style={step === 'players' ? undefined : undefined} />
      <AnimatePresence>
        <GameConfiguration
          key={step}
          transition={{
            duration: 0.2,
          }}
          initial={{
            opacity: 0,
            translateX: 200,
          }}
          animate={{
            opacity: 1,
            translateX: 0,
          }}
          exit={{
            opacity: 0,
            translateX: 200,
          }}>
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
      </AnimatePresence>
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
  ${mobileMQ} {
    position: fixed;
    bottom: 1rem;
    height: 50vh;
    padding: 0 1rem;
    max-width: 30rem;
    width: 100vw;

    left: auto;
    right: 0;
  }
`;

const GameConfiguration = styled(motion.div)`
  width: 100%;
  max-width: 40%;
  ${mobileMQ} {
    max-width: 100%;
    gap: 0.5rem;
    position: static;
  }
  display: flex;
  flex-direction: column;
  /* align-items: flex-end; */
  gap: 1.25rem;
  position: absolute;
  right: 0;
`;
