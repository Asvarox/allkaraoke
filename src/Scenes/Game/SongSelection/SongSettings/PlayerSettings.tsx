import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { PLAYER_NAMES_SESSION_STORAGE_KEY, PREVIOUS_PLAYER_NAMES_STORAGE_KEY } from 'hooks/players/consts';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { PlayerSetup, SongPreview } from 'interfaces';
import { useEffect, useMemo, useState } from 'react';
import gameStateEvents from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { useEventListenerSelector } from 'Scenes/Game/Singing/Hooks/useEventListener';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import SelectInputModal from 'Scenes/Game/SongSelection/SongSettings/PlayerSettings/SelectInputModal';
import SinglePlayer from 'Scenes/Game/SongSelection/SongSettings/PlayerSettings/SinglePlayer';
import { MicSetupPreferenceSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import PhoneManager from 'RemoteMic/PhoneManager';

interface Props {
    songPreview: SongPreview;
    onNextStep: (players: PlayerSetup[]) => void;
    keyboardControl: boolean;
    onExitKeyboardControl: () => void;
}

function useDefaultPlayerName(index: number): string {
    // If the player input changed in the meantime
    return useEventListenerSelector(gameStateEvents.playerInputChanged, () => {
        let defaultName = '';

        const source = InputManager.getPlayerInput(index);

        if (source?.inputSource === 'Remote Microphone') {
            defaultName = PhoneManager.getPhoneById(source.deviceId!)?.name || defaultName;
        }
        if (!defaultName) {
            const previousPlayerNames =
                JSON.parse(window.sessionStorage.getItem(PREVIOUS_PLAYER_NAMES_STORAGE_KEY)!) || [];

            defaultName = previousPlayerNames[index] ?? defaultName;
        }

        return defaultName || `Player #${index + 1}`;
    });
}

export default function PlayerSettings({ songPreview, onNextStep, keyboardControl, onExitKeyboardControl }: Props) {
    const defaultNames = [useDefaultPlayerName(0), useDefaultPlayerName(1)];
    const [storedPreference, setStoredPreference] = useSettingValue(MicSetupPreferenceSetting);

    const playerNames = useMemo<string[]>(
        () => JSON.parse(sessionStorage.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) ?? [],
        [],
    );

    const startSong = () => {
        onNextStep(playerSetup.map((setup, index) => ({ ...setup, name: setup.name || defaultNames[index] })));
    };

    const [playerSetup, setPlayerSetup] = useState<[PlayerSetup, PlayerSetup]>([
        { name: '', track: 0 },
        { name: '', track: Math.min(1, songPreview.tracksCount - 1) },
    ]);

    const updatePlayer = (index: number) => (setup: PlayerSetup) => {
        setPlayerSetup((current) => {
            const clone = [...current] as [PlayerSetup, PlayerSetup];
            clone[index] = setup;

            return clone;
        });
    };

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!showModal) {
            InputManager.startMonitoring();
        }
    }, [showModal]);

    const { register } = useKeyboardNav({ enabled: keyboardControl && !showModal, onBackspace: onExitKeyboardControl });

    const areInputsConfigured = !!storedPreference && storedPreference !== 'skip';

    return (
        <>
            {showModal && (
                <SelectInputModal
                    required={!areInputsConfigured}
                    onClose={() => setShowModal(false)}
                    playerNames={playerSetup.map((setup) => setup.name)}
                />
            )}
            <PlayerSettingContainer>
                <h3>Player 1</h3>
                <div>
                    <SinglePlayer
                        index={1}
                        setup={playerSetup[0]}
                        onChange={updatePlayer(0)}
                        playerNames={playerNames}
                        register={register}
                        defaultName={defaultNames[0]}
                        songPreview={songPreview}
                    />
                </div>
            </PlayerSettingContainer>
            <PlayerSettingContainer>
                <h3>Player 2</h3>
                <div>
                    <SinglePlayer
                        index={2}
                        setup={playerSetup[1]}
                        onChange={updatePlayer(1)}
                        playerNames={playerNames}
                        register={register}
                        defaultName={defaultNames[1]}
                        songPreview={songPreview}
                    />
                </div>
            </PlayerSettingContainer>
            {areInputsConfigured && (
                <PlayButton {...register('play', startSong, undefined, true)} data-test="play-song-button">
                    Play
                </PlayButton>
            )}
            <PlayButton
                {...register('mic-setup', () => setShowModal(true), undefined, false)}
                data-test="select-inputs-button">
                Setup mics
            </PlayButton>
        </>
    );
}

const PlayerSettingContainer = styled.div`
    display: flex;
    flex-direction: row;

    h3 {
        padding: 1.3rem;
        font-size: 4.5rem;
    }
`;

const PlayButton = styled(Button)<{ focused: boolean }>`
    padding: 0.5rem 9rem;
    font-size: 4.3rem;
`;
