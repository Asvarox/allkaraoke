import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { PLAYER_NAMES_SESSION_STORAGE_KEY, PREVIOUS_PLAYER_NAMES_STORAGE_KEY } from 'hooks/players/consts';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { PlayerSetup, SongPreview } from 'interfaces';
import { useEffect, useMemo, useState } from 'react';
import { useEventListenerSelector } from 'GameEvents/hooks';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import SelectInputModal from 'Scenes/SingASong/SongSelection/SongSettings/PlayerSettings/SelectInputModal';
import SinglePlayer from 'Scenes/SingASong/SongSelection/SongSettings/PlayerSettings/SinglePlayer';
import { MicSetupPreferenceSetting, MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import events from 'GameEvents/GameEvents';
import { typography } from 'Elements/cssMixins';

interface Props {
    songPreview: SongPreview;
    onNextStep: (players: PlayerSetup[]) => void;
    keyboardControl: boolean;
    onExitKeyboardControl: () => void;
}

function useDefaultPlayerName(index: number): string {
    // If the player input changed in the meantime
    return useEventListenerSelector(events.playerInputChanged, () => {
        let defaultName = '';

        const source = InputManager.getPlayerInput(index);

        if (source?.inputSource === 'Remote Microphone') {
            defaultName = RemoteMicManager.getRemoteMicById(source.deviceId!)?.name || defaultName;
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
    const [storedPreference] = useSettingValue(MicSetupPreferenceSetting);

    const playerNames = useMemo<string[]>(
        () => JSON.parse(sessionStorage.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) ?? [],
        [],
    );

    const startSong = () => {
        onNextStep(playerSetup.map((setup, index) => ({ ...setup, name: setup.name || defaultNames[index] })));
    };

    const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
    const [playerSetup, setPlayerSetup] = useState<[PlayerSetup, PlayerSetup]>([
        { name: '', track: 0 },
        { name: '', track: mobilePhoneMode ? 0 : Math.min(1, songPreview.tracksCount - 1) },
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

    const { register, focusElement } = useKeyboardNav({
        enabled: keyboardControl && !showModal,
        onBackspace: onExitKeyboardControl,
    });

    const areInputsConfigured = !!storedPreference && storedPreference !== 'skip';

    return (
        <>
            {showModal && (
                <SelectInputModal
                    required={!areInputsConfigured}
                    onClose={() => {
                        setShowModal(false);

                        if (areInputsConfigured) {
                            focusElement('play');
                        }
                    }}
                    playerNames={playerSetup.map((setup) => setup.name)}
                />
            )}
            <PlayerSettingContainer>
                <PlayerSettingTitle>Player 1</PlayerSettingTitle>
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
                <PlayerSettingTitle>Player 2</PlayerSettingTitle>
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
`;

const PlayButton = styled(Button)<{ focused: boolean }>`
    padding: 0.5rem 9rem;
    font-size: 4.3rem;
`;

const PlayerSettingTitle = styled.span`
    ${typography};
    padding: 1.3rem;
    font-size: 4.5rem;
`;
