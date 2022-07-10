import { Button } from 'Elements/Button';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { GAME_MODE, SingSetup, SongPreview } from 'interfaces';
import { isNumber } from 'lodash-es';
import { useState } from 'react';
import MicCheck from 'Scenes/Game/SongSelection/MicCheck';
import styled from 'styled-components';
import createPersistedState from 'use-persisted-state';
import { nextIndex, nextValueIndex, Switcher } from './Switcher';

interface Props {
    songPreview: SongPreview;
    onPlay: (setup: SingSetup & { file: string; video: string }) => void;
    keyboardControl: boolean;
    onExitKeyboardControl: () => void;
}

const gameModeNames = {
    [GAME_MODE.DUEL]: 'Duel',
    [GAME_MODE.PASS_THE_MIC]: 'Pass The Mic',
};

const difficultyNames = ['Real', 'Hard', 'Medium', 'Easy'];

if (process.env.NODE_ENV === 'development') {
    difficultyNames.push('Debug 4');
    difficultyNames.push('Debug 5');
    difficultyNames.push('Debug 6');
}

const getPlayerTrackName = (tracks: SongPreview['tracks'], index: number) =>
    tracks[index]?.name ?? `Track ${index + 1}`;

const useSetGameMode = createPersistedState<GAME_MODE>('song_settings-game_mode');
const useSetTolerance = createPersistedState<number>('song_settings-tolerance');
const useSetSkipIntro = createPersistedState<boolean>('song_settings-skip_intro');

export default function SongSettings({ songPreview, onPlay, keyboardControl, onExitKeyboardControl }: Props) {
    const [mode, setMode] = useSetGameMode(GAME_MODE.DUEL);
    const [playerTracks, setPlayerTracks] = useState<[number, number]>([0, Math.min(1, songPreview.tracksCount - 1)]);
    const [tolerance, setTolerance] = useSetTolerance(2);
    const [skipIntro, setSkipIntro] = useSetSkipIntro(false);

    const multipleTracks = songPreview.tracksCount > 1;

    const togglePlayerTrack = (player: number) =>
        setPlayerTracks((tracks) => {
            const newTracks: [number, number] = [...tracks];
            newTracks[player] = (tracks[player] + 1) % songPreview.tracksCount;

            return newTracks;
        });

    const startSong = () => {
        onPlay({ file: songPreview.file, mode, playerTracks, tolerance, video: songPreview.video, skipIntro });
    };

    const changeMode = () => {
        setMode((currentMode) => nextValueIndex(Object.values(GAME_MODE).filter(isNumber), currentMode));
    };

    const changeTolerance = () => setTolerance((current) => nextIndex(difficultyNames, current, -1));

    const { register } = useKeyboardNav({ enabled: keyboardControl, onBackspace: onExitKeyboardControl });

    return (
        <Container>
            <MicCheck />
            <GameConfiguration>
                {process.env.NODE_ENV === 'development' && (
                    <Switcher
                        {...register('skipIntro', () => setSkipIntro(!skipIntro), 'Skip intro')}
                        label="Skip intro"
                        value={skipIntro ? 'Yes' : 'No'}
                        data-test="skip-intro"
                        data-test-value={skipIntro}
                    />
                )}
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
                <PlayButton {...register('play', startSong, undefined, true)} data-test="play-song-button">
                    Play
                </PlayButton>
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
`;

const GameConfiguration = styled.div`
    width: auto;
    font-size: 0.35em;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5em;
`;

const PlayButton = styled(Button)<{ focused: boolean }>`
    padding-left: 2em;
    padding-right: 2em;
`;
