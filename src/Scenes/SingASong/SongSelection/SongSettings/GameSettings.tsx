import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { nextIndex, nextValue, Switcher } from 'Elements/Switcher';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { GAME_MODE, PlayerSetup, SingSetup, SongPreview } from 'interfaces';
import createPersistedState from 'use-persisted-state';
import { ValuesType } from 'utility-types';
import isDev from 'utils/isDev';
import { v4 } from 'uuid';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

interface Props {
    songPreview: SongPreview;
    onNextStep: (setup: SingSetup) => void;
    keyboardControl: boolean;
    onExitKeyboardControl: () => void;
}

const gameModeNames = {
    [GAME_MODE.DUEL]: 'Duel',
    [GAME_MODE.PASS_THE_MIC]: 'Pass The Mic',
};

const difficultyNames = ['Hard', 'Medium', 'Easy'];

if (isDev()) {
    difficultyNames.push('Debug 4');
    difficultyNames.push('Debug 5');
    difficultyNames.push('Debug 6');
}

// added -v2 to the key as the value has changed from number to ValuesType<typeof GAME_MODE>
const useSetGameMode = createPersistedState<ValuesType<typeof GAME_MODE>>('song_settings-game_mode-v2');
const useSetTolerance = createPersistedState<number>('song_settings-tolerance-v2');

export default function GameSettings({ songPreview, onNextStep, keyboardControl, onExitKeyboardControl }: Props) {
    const [mode, setMode] = useSetGameMode(GAME_MODE.DUEL);
    const [tolerance, setTolerance] = useSetTolerance(1);

    const startSong = () => {
        const singSetup = {
            id: v4(),
            players: [
                { name: '', track: 0 },
                { name: '', track: 0 },
            ] as [PlayerSetup, PlayerSetup],
            mode,
            tolerance: tolerance + 1,
        };
        onNextStep(singSetup);
    };

    const changeMode = () => {
        setMode((currentMode) => nextValue(Object.values(GAME_MODE), currentMode));
    };

    const changeTolerance = () => setTolerance((current) => nextIndex(difficultyNames, current, -1));

    const { register } = useKeyboardNav({ enabled: keyboardControl, onBackspace: onExitKeyboardControl });

    return (
        <>
            <GSSwitcher
                {...register('difficulty', changeTolerance, 'Change difficulty')}
                label="Difficulty"
                value={difficultyNames[tolerance]}
                data-test="difficulty-setting"
                data-test-value={difficultyNames[tolerance]}
            />
            <GSSwitcher
                {...register('mode', changeMode, 'Change mode')}
                label="Mode"
                value={gameModeNames[mode]}
                data-test="game-mode-setting"
                data-test-value={gameModeNames[mode]}
            />
            <ModeDescription>
                {mode === GAME_MODE.DUEL && 'Face off against each other - person that earns more points wins.'}
                {mode === GAME_MODE.PASS_THE_MIC && (
                    <>
                        For more than 2 players - split into groups and pass the microphone within the group when
                        prompted with <SwapHorizIcon /> symbol.
                    </>
                )}
            </ModeDescription>
            <PlayButton {...register('play', startSong, undefined, true)} data-test="next-step-button">
                Next ➤
            </PlayButton>
        </>
    );
}

const PlayButton = styled(Button)`
    padding: 0.5rem 9rem;
    font-size: 4.3rem;
    width: 50rem;
`;

const ModeDescription = styled.h3`
    max-width: 50rem;
    margin: -1rem 0 1rem !important;
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.7);
    box-sizing: border-box;
`;

const GSSwitcher = styled(Switcher)`
    font-size: 4.3rem;
    padding: 1rem;
    min-width: 50rem;
    box-sizing: border-box;
`;
