import styled from '@emotion/styled';
import { Autocomplete } from 'Elements/Autocomplete';
import { Button } from 'Elements/Button';
import { Switcher } from 'Elements/Switcher';
import { PLAYER_NAMES_SESSION_STORAGE_KEY, PREVIOUS_PLAYER_NAMES_STORAGE_KEY } from 'hooks/players/consts';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { PlayerSetup, SongPreview } from 'interfaces';
import { useMemo, useRef, useState } from 'react';
import PhonesManager from 'Scenes/ConnectPhone/PhonesManager';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';

interface Props {
    songPreview: SongPreview;
    onNextStep: (players: PlayerSetup[]) => void;
    keyboardControl: boolean;
    onExitKeyboardControl: () => void;
}

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

const getTrackName = (tracks: SongPreview['tracks'], index: number) => tracks[index]?.name ?? `Track ${index + 1}`;
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

    const [playerTracks, setPlayerTracks] = useState<[number, number]>([0, Math.min(1, songPreview.tracksCount - 1)]);
    const multipleTracks = songPreview.tracksCount > 1;
    const togglePlayerTrack = (player: number) =>
        setPlayerTracks((tracks) => {
            const newTracks: [number, number] = [...tracks];
            newTracks[player] = (tracks[player] + 1) % songPreview.tracksCount;

            return newTracks;
        });

    const startSong = () => {
        onNextStep([
            { name: p1Name || p1DefaultName, track: playerTracks[0] },
            { name: p2Name || p2DefaultName, track: playerTracks[1] },
        ]);
    };

    const { register } = useKeyboardNav({ enabled: keyboardControl, onBackspace: onExitKeyboardControl });

    return (
        <>
            <PlayerSettingContainer>
                <h3>Player 1</h3>
                <div>
                    <Autocomplete
                        options={playerNames}
                        onChange={setP1Name}
                        value={p1Name}
                        label="Name:"
                        ref={p1NameRef}
                        {...register('p1name', () => p1NameRef.current?.focus())}
                        placeholder={p1DefaultName}
                        data-test="player-1-name"
                    />
                    {multipleTracks && (
                        <Switcher
                            {...register('p1 track', () => togglePlayerTrack(0), 'Change track')}
                            label="Track"
                            value={getTrackName(songPreview.tracks, playerTracks[0])}
                            data-test="player-1-track-setting"
                            data-test-value={playerTracks[0] + 1}
                        />
                    )}
                </div>
            </PlayerSettingContainer>
            <PlayerSettingContainer>
                <h3>Player 2</h3>
                <div>
                    <Autocomplete
                        options={playerNames}
                        onChange={setP2Name}
                        value={p2Name}
                        label="Name:"
                        ref={p2NameRef}
                        placeholder={p2DefaultName}
                        {...register('p2name', () => p2NameRef.current?.focus())}
                        data-test="player-2-name"
                    />
                    {multipleTracks && (
                        <Switcher
                            {...register('p2 track', () => togglePlayerTrack(1), 'Change track')}
                            label="Track"
                            value={getTrackName(songPreview.tracks, playerTracks[1])}
                            data-test="player-2-track-setting"
                            data-test-value={playerTracks[1] + 1}
                        />
                    )}
                </div>
            </PlayerSettingContainer>
            <PlayButton {...register('play', startSong, undefined, true)} data-test="play-song-button">
                Play
            </PlayButton>
        </>
    );
}

const PlayerSettingContainer = styled.div`
    display: flex;
    flex-direction: row;

    h3 {
        padding: 0.25em;
    }
`;

const PlayButton = styled(Button)<{ focused: boolean }>`
    padding-left: 2em;
    padding-right: 2em;
`;
