import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { nextIndex, nextValueIndex, Switcher } from 'Elements/Switcher';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { GAME_MODE, PlayerSetup, SingSetup, SongPreview } from 'interfaces';
import { isNumber } from 'lodash-es';
import { useState } from 'react';
import getSongFirstNoteMs from 'Scenes/Game/Singing/GameState/Helpers/getSongFirstNoteMs';
import createPersistedState from 'use-persisted-state';
import isDev from 'utils/isDev';

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

const getPlayerTrackName = (tracks: SongPreview['tracks'], index: number) =>
    tracks[index]?.name ?? `Track ${index + 1}`;

const useSetGameMode = createPersistedState<GAME_MODE>('song_settings-game_mode');
const useSetTolerance = createPersistedState<number>('song_settings-tolerance');
const useSetSkipIntro = createPersistedState<boolean>('song_settings-skip_intro');

const SKIP_INTRO_THRESHOLD_MS = 20_000;

export default function GameSettings({ songPreview, onNextStep, keyboardControl, onExitKeyboardControl }: Props) {
    const [mode, setMode] = useSetGameMode(GAME_MODE.DUEL);
    const [playerTracks, setPlayerTracks] = useState<[number, number]>([0, Math.min(1, songPreview.tracksCount - 1)]);
    const [tolerance, setTolerance] = useSetTolerance(2);
    const [skipIntro, setSkipIntro] = useSetSkipIntro(false);

    const multipleTracks = songPreview.tracksCount > 1;

    const lyricStartMs = getSongFirstNoteMs(songPreview);
    const hasLongIntro = lyricStartMs - (songPreview.videoGap ?? 0) * 1000 > SKIP_INTRO_THRESHOLD_MS;

    const proposeSkipIntro = hasLongIntro || isDev();

    const togglePlayerTrack = (player: number) =>
        setPlayerTracks((tracks) => {
            const newTracks: [number, number] = [...tracks];
            newTracks[player] = (tracks[player] + 1) % songPreview.tracksCount;

            return newTracks;
        });

    const startSong = () => {
        const singSetup = {
            players: playerTracks.map((track, index) => ({
                name: '',
                track: track,
            })) as [PlayerSetup, PlayerSetup],
            mode,
            tolerance,
            skipIntro: proposeSkipIntro && skipIntro,
        };
        onNextStep(singSetup);
    };

    const changeMode = () => {
        setMode((currentMode) => nextValueIndex(Object.values(GAME_MODE).filter(isNumber), currentMode));
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
            {multipleTracks && (
                <>
                    <Switcher
                        {...register('p1 track', () => togglePlayerTrack(0), 'Change track')}
                        label="Player 1"
                        value={getPlayerTrackName(songPreview.tracks, playerTracks[0])}
                        data-test="player-1-track-setting"
                        data-test-value={playerTracks[0] + 1}
                    />
                    <Switcher
                        {...register('p2 track', () => togglePlayerTrack(1), 'Change track')}
                        label="Player 2"
                        value={getPlayerTrackName(songPreview.tracks, playerTracks[1])}
                        data-test="player-2-track-setting"
                        data-test-value={playerTracks[1] + 1}
                    />
                </>
            )}
            {proposeSkipIntro && (
                <Switcher
                    {...register('skipIntro', () => setSkipIntro(!skipIntro), 'Skip intro')}
                    label="Skip intro"
                    value={skipIntro ? 'Yes' : 'No'}
                    data-test="skip-intro"
                    data-test-value={skipIntro}
                />
            )}
            <PlayButton {...register('play', startSong, undefined, true)} data-test="play-song-button">
                Players ➤
            </PlayButton>
        </>
    );
}

const PlayButton = styled(Button)<{ focused: boolean }>`
    padding-left: 2em;
    padding-right: 2em;
`;
