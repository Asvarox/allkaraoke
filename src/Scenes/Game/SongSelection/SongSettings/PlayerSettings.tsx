import styled from '@emotion/styled';
import { Autocomplete } from 'Elements/Autocomplete';
import { Button } from 'Elements/Button';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { SongPreview } from 'interfaces';
import { useMemo, useRef, useState } from 'react';
import PhonesManager from 'Scenes/ConnectPhone/PhonesManager';
import gameStateEvents from 'Scenes/Game/Singing/GameState/GameStateEvents';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';

interface Props {
    songPreview: SongPreview;
    onNextStep: (players: Array<{ name: string }>) => void;
    keyboardControl: boolean;
    onExitKeyboardControl: () => void;
}

const PLAYER_NAMES_SESSION_STORAGE_KEY = 'session-player-names';
const PREVIOUS_PLAYER_NAMES_STORAGE_KEY = 'previous-player-names';

gameStateEvents.songStarted.subscribe((_, singSetup) => {
    let currentNames = JSON.parse(window.sessionStorage.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) || [];
    const thisPlayNames = singSetup.players.map(({ name }) => name.trim());

    const newNamesSet = [...currentNames].concat(...thisPlayNames);
    currentNames = [...new Set(newNamesSet)].filter(Boolean);

    window.sessionStorage.setItem(PLAYER_NAMES_SESSION_STORAGE_KEY, JSON.stringify(currentNames));
    window.sessionStorage.setItem(PREVIOUS_PLAYER_NAMES_STORAGE_KEY, JSON.stringify(thisPlayNames));
});

function useDefaultPlayerName(index: number): string {
    return useMemo(() => {
        let defaultName = '';

        const source = InputManager.getPlayerInput(index);

        if (source?.inputSource === 'Remote Microphone') {
            defaultName = PhonesManager.getPhoneById(source.deviceId!)?.name || defaultName;
        }
        if (!defaultName) {
            const previousPlayerNames =
                JSON.parse(window.sessionStorage.getItem(PREVIOUS_PLAYER_NAMES_STORAGE_KEY)!) || [];

            defaultName = previousPlayerNames[index] ?? defaultName;
        }

        return defaultName || `Player #${index + 1}`;
    }, [index]);
}
export default function PlayerSettings({ songPreview, onNextStep, keyboardControl, onExitKeyboardControl }: Props) {
    const p1NameRef = useRef<HTMLInputElement | null>(null);
    const [p1Name, setP1Name] = useState('');
    const p1DefaultName = useDefaultPlayerName(0);
    const p2NameRef = useRef<HTMLInputElement | null>(null);
    const [p2Name, setP2Name] = useState('');
    const p2DefaultName = useDefaultPlayerName(1);

    const playerNames = useMemo<string[]>(
        () => JSON.parse(sessionStorage.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) ?? [],
        [],
    );

    const startSong = () => {
        onNextStep([{ name: p1Name || p1DefaultName }, { name: p2Name || p2DefaultName }]);
    };

    const { register } = useKeyboardNav({ enabled: keyboardControl, onBackspace: onExitKeyboardControl });

    return (
        <>
            <h3>Player 1</h3>
            <Autocomplete
                options={playerNames}
                onChange={setP1Name}
                value={p1Name}
                label="Name"
                ref={p1NameRef}
                {...register('p1name', () => p1NameRef.current?.focus())}
                placeholder={p1DefaultName}
            />
            <h3>Player 2</h3>
            <Autocomplete
                options={playerNames}
                onChange={setP2Name}
                value={p2Name}
                label="Name"
                ref={p2NameRef}
                placeholder={p2DefaultName}
                {...register('p2name', () => p2NameRef.current?.focus())}
            />
            <PlayButton {...register('play', startSong, undefined, true)} data-test="play-song-button">
                Play
            </PlayButton>
        </>
    );
}

const PlayButton = styled(Button)<{ focused: boolean }>`
    padding-left: 2em;
    padding-right: 2em;
`;
