import styled from '@emotion/styled';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { typography } from 'Elements/cssMixins';
import { useEventEffect, useEventListenerSelector } from 'GameEvents/hooks';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import { CircularProgress } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import backgroundMusic from 'assets/459342__papaninkasettratat__cinematic-music-short.mp3';
import { waitFinished } from 'SoundManager';
import sleep from 'utils/sleep';
import events from 'GameEvents/GameEvents';

interface Props {
    onFinish: () => void;
}
function WaitForReadiness({ onFinish }: Props) {
    const audio = useRef<HTMLAudioElement>(null);
    const [areAllPlayersReady, setAreAllPlayersReady] = useState(false);

    const [confirmedPlayers, setConfirmedPlayers] = useState<string[]>([]);
    useEventEffect(events.readinessConfirmed, (deviceId) => {
        setConfirmedPlayers((current) => [...current, deviceId]);
    });

    const players = useEventListenerSelector([events.inputListChanged, events.readinessConfirmed], () => {
        return InputManager.getInputs().map((input, index) => [
            input.deviceId!,
            GameState.getPlayers()[index]?.getName() ?? undefined,
        ]);
    });

    useEffect(() => {
        (async () => {
            // can't use `areAllPlayersReady` as it would need to be specified as useEffect dependency
            let allInputsReady = false;
            const inputsReady = InputManager.requestReadiness().then(() => {
                allInputsReady = true;
                setAreAllPlayersReady(true);
            });
            const minTimeElapsed = sleep(1_500);
            const maxTimeElapsed = sleep(15_000);

            // Only start the music if waiting for readiness takes some time
            await sleep(250);
            if (!allInputsReady) {
                await audio?.current?.play();
            }

            await Promise.race([Promise.all([inputsReady, minTimeElapsed]), maxTimeElapsed]);
            if (!audio?.current?.paused) waitFinished.play();
            await sleep(500);
            audio?.current?.pause();
            await sleep(1000);
            onFinish();
        })();
    }, []);

    const playerStatuses = players.map(([deviceId, name]) => ({
        confirmed: confirmedPlayers.includes(deviceId),
        name,
    }));

    return (
        <>
            {!areAllPlayersReady && (
                <WaitingForReady>
                    <span>
                        Waiting for all players to click <strong>"Ready"</strong>
                    </span>
                    <PlayerList>
                        {playerStatuses.map(({ confirmed, name }, index) => (
                            <PlayerEntry
                                key={index}
                                data-test="player-confirm-status"
                                data-name={name}
                                data-confirmed={confirmed}>
                                {confirmed ? <CheckCircleOutline /> : <CircularProgress color="info" size="1em" />}{' '}
                                {name ? name : 'Connecting...'}
                            </PlayerEntry>
                        ))}
                    </PlayerList>
                </WaitingForReady>
            )}
            <audio
                src={backgroundMusic}
                ref={audio}
                hidden
                autoPlay={false}
                onPlay={(e: SyntheticEvent<HTMLAudioElement>) => {
                    e.currentTarget.volume = 0.8;
                }}
            />
        </>
    );
}

const WaitingForReady = styled.div`
    top: 0;
    left: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: absolute;
    width: 100%;
    height: 100%;

    font-size: 7rem;
    ${typography};
`;

const PlayerList = styled.div`
    margin-top: 5rem;
    display: flex;
    flex-direction: column;
    gap: 5rem;
`;

const PlayerEntry = styled.div`
    display: flex;
    align-items: center;
    //justify-content: center;
    gap: 2rem;
    svg {
        width: 7rem;
        height: 7rem;
        stroke: black;
    }
`;

export default WaitForReadiness;
