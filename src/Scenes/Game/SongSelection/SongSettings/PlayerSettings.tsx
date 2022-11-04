import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { PLAYER_NAMES_SESSION_STORAGE_KEY, PREVIOUS_PLAYER_NAMES_STORAGE_KEY } from 'hooks/players/consts';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { PlayerSetup, SongPreview } from 'interfaces';
import { useMemo, useState } from 'react';
import PhonesManager from 'Scenes/ConnectPhone/PhonesManager';
import gameStateEvents from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { useEventListenerSelector } from 'Scenes/Game/Singing/Hooks/useEventListener';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import SelectInputModal from 'Scenes/Game/SongSelection/SongSettings/PlayerSettings/SelectInputModal';
import SinglePlayer from 'Scenes/Game/SongSelection/SongSettings/PlayerSettings/SinglePlayer';

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
            defaultName = PhonesManager.getPhoneById(source.deviceId!)?.name || defaultName;
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
    const p1DefaultName = useDefaultPlayerName(0);
    const p2DefaultName = useDefaultPlayerName(1);

    const playerNames = useMemo<string[]>(
        () => JSON.parse(sessionStorage.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) ?? [],
        [],
    );

    const startSong = () => {
        onNextStep(playerSetup);
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

    const { register } = useKeyboardNav({ enabled: keyboardControl && !showModal, onBackspace: onExitKeyboardControl });

    return (
        <>
            {showModal && (
                <SelectInputModal
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
                        defaultName={p1DefaultName}
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
                        defaultName={p2DefaultName}
                        songPreview={songPreview}
                    />
                </div>
            </PlayerSettingContainer>
            <PlayButton {...register('play', startSong, undefined, true)} data-test="play-song-button">
                Play
            </PlayButton>
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
        padding: 0.25em;
    }
`;

const PlayButton = styled(Button)<{ focused: boolean }>`
    padding-left: 2em;
    padding-right: 2em;
`;
