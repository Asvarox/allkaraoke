import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { PlayerSetup, SingSetup, SongPreview } from '~/interfaces';
import events from '~/modules/GameEvents/GameEvents';
import GameSettings from '~/routes/SingASong/SongSelectionV2/Components/SongSettings/GameSettings';
import MicCheck from '~/routes/SingASong/SongSelectionV2/Components/SongSettings/MicCheck';
import PlayerSettings from '~/routes/SingASong/SongSelectionV2/Components/SongSettings/PlayerSettings';

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
    <div className="mobile:fixed mobile:bottom-4 mobile:h-[50vh] mobile:px-4 mobile:max-w-120 mobile:w-screen mobile:left-auto mobile:right-0 flex w-full flex-row items-end justify-between [&_hr]:m-4 [&_hr]:opacity-25">
      <MicCheck style={step === 'players' ? undefined : undefined} />
      <AnimatePresence>
        <motion.div
          className="mobile:max-w-full mobile:gap-2 mobile:static absolute right-0 flex w-full max-w-[40%] flex-col gap-5"
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
