import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { nextIndex, nextValue, Switcher } from 'Elements/Switcher';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { GAME_MODE, PlayerSetup, SingSetup, SongPreview } from 'interfaces';
import getSongFirstNoteMs from 'Scenes/Game/Singing/GameState/Helpers/getSongFirstNoteMs';
import createPersistedState from 'use-persisted-state';
import { ValuesType } from 'utility-types';
import isDev from 'utils/isDev';
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
};

const difficultyNames = ['Real', 'Hard', 'Medium', 'Easy'];

if (isDev()) {
    difficultyNames.push('Debug 4');
    difficultyNames.push('Debug 5');
    difficultyNames.push('Debug 6');
}

// added -v2 to the key as the value has changed from number to ValuesType<typeof GAME_MODE>
const useSetGameMode = createPersistedState<ValuesType<typeof GAME_MODE>>('song_settings-game_mode-v2');
const useSetTolerance = createPersistedState<number>('song_settings-tolerance');
const useSetSkipIntro = createPersistedState<boolean>('song_settings-skip_intro');

const SKIP_INTRO_THRESHOLD_MS = 20_000;

export default function GameSettings({ songPreview, onNextStep, keyboardControl, onExitKeyboardControl }: Props) {
    const [mode, setMode] = useSetGameMode(GAME_MODE.DUEL);
    const [tolerance, setTolerance] = useSetTolerance(2);
    const [skipIntro, setSkipIntro] = useSetSkipIntro(false);

    const lyricStartMs = getSongFirstNoteMs(songPreview);
    const hasLongIntro = lyricStartMs - (songPreview.videoGap ?? 0) * 1000 > SKIP_INTRO_THRESHOLD_MS;

    const proposeSkipIntro = hasLongIntro || isDev();

    const startSong = () => {
        const singSetup = {
            id: v4(),
            players: [
                { name: '', track: 0 },
                { name: '', track: 0 },
            ] as [PlayerSetup, PlayerSetup],
            mode,
            tolerance,
            skipIntro: proposeSkipIntro && skipIntro,
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
            <Switcher
                {...register('difficulty', changeTolerance, 'Change difficulty')}
                label="Difficulty"
                value={difficultyNames[tolerance]}
                data-test="difficulty-setting"
                data-test-value={difficultyNames[tolerance]}
            />
            <Switcher
                {...register('mode', changeMode, 'Change mode')}
                label="Mode"
                value={gameModeNames[mode]}
                data-test="game-mode-setting"
                data-test-value={gameModeNames[mode]}
            />
            {proposeSkipIntro && (
                <Switcher
                    {...register('skipIntro', () => setSkipIntro(!skipIntro), 'Skip intro')}
                    label="Skip intro"
                    value={skipIntro ? 'Yes' : 'No'}
                    data-test="skip-intro"
                    data-test-value={skipIntro}
                />
            )}
            <PlayButton {...register('play', startSong, undefined, true)} data-test="next-step-button">
                Players ➤
            </PlayButton>
        </>
    );
}

const PlayButton = styled(Button)<{ focused: boolean }>`
    padding-left: 2em;
    padding-right: 2em;
`;
