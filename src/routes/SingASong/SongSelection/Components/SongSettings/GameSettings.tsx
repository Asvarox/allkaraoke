import { SwapHoriz as SwapHorizIcon } from '@mui/icons-material';
import { GAME_MODE, SingSetup, SongPreview } from 'interfaces';
import { Button } from 'modules/Elements/Button';
import { Switcher } from 'modules/Elements/Switcher';
import { nextIndex, nextValue } from 'modules/Elements/Utils/indexes';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import isDev from 'modules/utils/isDev';
import createPersistedState from 'use-persisted-state';
import { ValuesType } from 'utility-types';
import { v4 } from 'uuid';

interface Props {
  songPreview: SongPreview;
  onNextStep: (setup: SingSetup) => void;
  keyboardControl: boolean;
  onExitKeyboardControl: () => void;
}

const gameModeNames = {
  [GAME_MODE.DUEL]: 'Duel',
  [GAME_MODE.PASS_THE_MIC]: 'Pass The Mic',
  [GAME_MODE.CO_OP]: 'Cooperation',
};

const difficultyNames = ['Hard', 'Medium', 'Easy'];

if (isDev()) {
  difficultyNames.push('Debug 4');
  difficultyNames.push('Debug 5');
  difficultyNames.push('Debug 6');
}

// added -v3 to the key as the value to handle default selection if it wasnt changed
const useSetGameMode = createPersistedState<ValuesType<typeof GAME_MODE> | null>('song_settings-game_mode-v3');
const useSetTolerance = createPersistedState<number>('song_settings-tolerance-v2');

export default function GameSettings({ songPreview, onNextStep, keyboardControl, onExitKeyboardControl }: Props) {
  const [rememberedMode, setMode] = useSetGameMode(null);
  const mode = rememberedMode ?? (songPreview.tracksCount > 1 ? GAME_MODE.CO_OP : GAME_MODE.DUEL);
  const [tolerance, setTolerance] = useSetTolerance(1);

  const handleNextButton = () => {
    const singSetup = {
      id: v4(),
      players: [],
      mode,
      tolerance: tolerance + 1,
    };
    onNextStep(singSetup);
  };

  const changeMode = () => {
    setMode(nextValue(Object.values(GAME_MODE), mode));
  };

  const changeTolerance = () => setTolerance((current) => nextIndex(difficultyNames, current, -1));

  const { register } = useKeyboardNav({
    enabled: keyboardControl,
    onBackspace: onExitKeyboardControl,
    additionalHelp: {
      remote: ['select-song'],
    },
  });

  return (
    <>
      <Switcher
        {...register('difficulty-setting', changeTolerance, 'Change difficulty')}
        label="Difficulty"
        value={difficultyNames[tolerance]}
        data-test-value={difficultyNames[tolerance]}
        className="w-full"
      />
      <Switcher
        {...register('game-mode-setting', changeMode, 'Change mode')}
        label="Mode"
        value={gameModeNames[mode]}
        data-test-value={gameModeNames[mode]}
        className="w-full"
      />
      <div className="typography mobile:text-sm mobile:mt-0 -mt-3 w-full bg-black/70 px-3 py-2 text-lg">
        {mode === GAME_MODE.DUEL && 'Face off against each other - person that earns more points wins.'}
        {mode === GAME_MODE.CO_OP && 'Join forces and sing together - your points will be added up to a single pool.'}
        {mode === GAME_MODE.PASS_THE_MIC && (
          <>
            For more than 2 players - split into groups and pass the microphone within the group when prompted with{' '}
            <SwapHorizIcon /> symbol.
          </>
        )}
      </div>
      <Button
        size="large"
        {...register('next-step-button', handleNextButton, undefined, true)}
        className="mobile:px-10 mobile:h-10 mobile:text-md px-20 py-1">
        Next ➤
      </Button>
    </>
  );
}
