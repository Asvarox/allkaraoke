import { isNumber } from 'lodash';
import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../../Elements/Button';
import { focusable } from '../../../Elements/cssMixins';
import useKeyboardNav from '../../../Hooks/useKeyboardNav';
import { GAME_MODE, SingSetup, SongPreview } from '../../../interfaces';
import { Switcher } from './Switcher';

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

enum Element {
    PLAY,
    PLAYER_2_TRACK,
    PLAYER_1_TRACK,
    MODE,
    DIFFICULTY,
}

const difficultyNames = ['Real', 'Hard', 'Medium', 'Easy'];

const getPlayerTrackName = (tracks: SongPreview['tracks'], index: number) =>
    tracks[index]?.name ?? `Track ${index + 1}`;

export default function SongSettings({ songPreview, onPlay, keyboardControl, onExitKeyboardControl }: Props) {
    const [mode, setMode] = useState(GAME_MODE.DUEL);
    const [playerTracks, setPlayerTracks] = useState<[number, number]>([0, Math.min(1, songPreview.tracksCount - 1)]);
    const [focusedElement, setFocusedEelement] = useState<number>(0);
    const [tolerance, setTolerance] = useState<number>(2);

    const multipleTracks = songPreview.tracksCount > 1;

    const togglePlayerTrack = (player: number) =>
        setPlayerTracks((tracks) => {
            const newTracks: [number, number] = [...tracks];
            newTracks[player] = (tracks[player] + 1) % songPreview.tracksCount;

            return newTracks;
        });

    const startSong = () => onPlay({ file: songPreview.file, mode, playerTracks, tolerance, video: songPreview.video });

    const enabledElements = multipleTracks
        ? [Element.PLAY, Element.PLAYER_2_TRACK, Element.PLAYER_1_TRACK, Element.MODE, Element.DIFFICULTY]
        : [Element.PLAY, Element.MODE, Element.DIFFICULTY];

    const isFocused = (elem: Element) => keyboardControl && enabledElements[focusedElement] === elem;

    const handleNavigation = (i: number, elements: Element[]) => {
        setFocusedEelement((elements.length + i + focusedElement) % elements.length);
    };

    const changeMode = () => {
        setMode((currentMode) => {
            const modes = Object.values(GAME_MODE).filter((val) => isNumber(val));
            const currentModeIndex = modes.indexOf(currentMode);

            return (currentModeIndex + 1) % modes.length;
        });
    };

    const changeTolerance = () =>
        setTolerance((current) => (difficultyNames.length + current - 1) % difficultyNames.length);

    const handleEnter = () => {
        if (isFocused(Element.PLAY)) startSong();
        else if (isFocused(Element.PLAYER_1_TRACK)) togglePlayerTrack(0);
        else if (isFocused(Element.PLAYER_2_TRACK)) togglePlayerTrack(1);
        else if (isFocused(Element.MODE)) changeMode();
        else if (isFocused(Element.DIFFICULTY)) changeTolerance();
    };

    useKeyboardNav(
        {
            onUpArrow: () => handleNavigation(1, enabledElements),
            onDownArrow: () => handleNavigation(-1, enabledElements),
            onEnter: () => handleEnter(),
            onBackspace: onExitKeyboardControl,
        },
        keyboardControl,
        [enabledElements, songPreview, mode, playerTracks],
    );

    return (
        <GameConfiguration>
            <Switcher
                label="Difficulty"
                value={difficultyNames[tolerance]}
                focused={isFocused(Element.DIFFICULTY)}
                onClick={changeTolerance}
                data-test="difficulty-setting"
                data-test-value={difficultyNames[tolerance]}
            />
            <Switcher
                label="Mode"
                value={gameModeNames[mode]}
                focused={isFocused(Element.MODE)}
                onClick={changeMode}
                data-test="game-mode-setting"
                data-test-value={gameModeNames[mode]}
            />
            {songPreview.tracksCount > 1 && (
                <>
                    <Switcher
                        label="Player 1"
                        value={getPlayerTrackName(songPreview.tracks, playerTracks[0])}
                        onClick={() => togglePlayerTrack(0)}
                        focused={isFocused(Element.PLAYER_1_TRACK)}
                        data-test="player-1-track-setting"
                        data-test-value={playerTracks[0] + 1}
                    />
                    <Switcher
                        label="Player 2"
                        value={getPlayerTrackName(songPreview.tracks, playerTracks[1])}
                        onClick={() => togglePlayerTrack(1)}
                        focused={isFocused(Element.PLAYER_2_TRACK)}
                        data-test="player-2-track-setting"
                        data-test-value={playerTracks[1] + 1}
                    />
                </>
            )}
            <PlayButton onClick={startSong} focused={isFocused(Element.PLAY)} data-test="play-song-button">
                Play <span style={{ fontSize: '40px' }}>»</span>
            </PlayButton>
        </GameConfiguration>
    );
}

const GameConfiguration = styled.div`
    width: auto;
    font-size: 0.35em;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5em;
`;

const PlayButton = styled(Button)<{ focused: boolean }>`
    ${focusable}
`;
