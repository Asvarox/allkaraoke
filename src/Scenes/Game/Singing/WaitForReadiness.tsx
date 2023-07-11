import styled from '@emotion/styled';
import { CheckCircleOutline } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { typography } from 'Elements/cssMixins';
import events from 'GameEvents/GameEvents';
import { useEventEffect, useEventListenerSelector } from 'GameEvents/hooks';
import PlayersManager from 'Players/PlayersManager';
import SinglePlayer from 'Scenes/SingASong/SongSelection/SongSettings/MicCheck/SinglePlayer';
import { waitFinished } from 'SoundManager';
import backgroundMusic from 'assets/459342__papaninkasettratat__cinematic-music-short.mp3';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';
import sleep from 'utils/sleep';

interface Props {
    onFinish: () => void;
}

const AUTOSTART_TIMEOUT_S = 1500;

function WaitForReadiness({ onFinish }: Props) {
    const audio = useRef<HTMLAudioElement>(null);
    const [areAllPlayersReady, setAreAllPlayersReady] = useState(false);

    const [confirmedPlayers, setConfirmedPlayers] = useState<string[]>([]);
    useEventEffect(events.readinessConfirmed, (deviceId) => {
        setConfirmedPlayers((current) => [...current, deviceId]);
    });

    const players = useEventListenerSelector([events.inputListChanged, events.readinessConfirmed], () => {
        return PlayersManager.getPlayers().map(
            (player, index) => [player.input.deviceId!, player.getName(), player] as const,
        );
    });

    useEffect(() => {
        (async () => {
            // can't use `areAllPlayersReady` as it would need to be specified as useEffect dependency
            let allInputsReady = false;
            const inputsReady = PlayersManager.requestReadiness().then(() => {
                allInputsReady = true;
                setAreAllPlayersReady(true);
            });
            const minTimeElapsed = sleep(1_500);
            const maxTimeElapsed = sleep(AUTOSTART_TIMEOUT_S * 1_000);

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

    const playerStatuses = players.map(([deviceId, name, player]) => ({
        confirmed: confirmedPlayers.includes(deviceId),
        name,
        player: player,
    }));

    return (
        <>
            {!areAllPlayersReady && (
                <WaitingForReady>
                    <span>
                        Waiting for all players to click <strong>"Ready"</strong>
                    </span>
                    <PlayerList>
                        {playerStatuses.map(({ confirmed, name, player }, index) => (
                            <PlayerEntry
                                className="ph-no-capture"
                                key={index}
                                data-test="player-confirm-status"
                                data-name={name}
                                data-confirmed={confirmed}>
                                <ConfirmStatus>
                                    {confirmed ? <CheckCircleOutline /> : <CircularProgress color="info" size="1em" />}
                                </ConfirmStatus>{' '}
                                <SinglePlayer player={player} />
                            </PlayerEntry>
                        ))}
                    </PlayerList>
                    <TimeoutMessage>
                        The song will start automatically in{' '}
                        <strong>
                            <CountUp
                                end={0}
                                start={AUTOSTART_TIMEOUT_S}
                                duration={AUTOSTART_TIMEOUT_S}
                                useEasing={false}
                            />
                        </strong>
                    </TimeoutMessage>
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
    gap: 5rem;

    font-size: 5rem;
    ${typography};
`;

const TimeoutMessage = styled.span`
    font-size: 5rem;
`;

const PlayerList = styled.div`
    //margin-top: 5rem;
    display: flex;
    flex-direction: column;
    gap: 5rem;
    width: 50rem;
`;

const PlayerEntry = styled.div`
    display: flex;
    align-items: center;
    //justify-content: center;
    gap: 2rem;
    transform: scale(1.5);
`;

const ConfirmStatus = styled.span`
    svg {
        width: 5rem;
        height: 5rem;
        stroke: black;
    }
`;

export default WaitForReadiness;
