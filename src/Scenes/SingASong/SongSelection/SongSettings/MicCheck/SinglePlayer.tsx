import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { useEffect } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { PlayerMicCheck } from 'Elements/VolumeIndicator';
import { useEventListener, useEventListenerSelector } from 'GameEvents/hooks';
import events from 'GameEvents/GameEvents';
import NoiseDetection from 'Scenes/SingASong/SongSelection/SongSettings/MicCheck/NoiseDetection';
import Ping from 'Scenes/SingASong/SongSelection/SongSettings/MicCheck/Ping';
import PlayersManager, { PlayerEntity } from "Players/PlayersManager";
import PlayerStatus from "Scenes/SingASong/SongSelection/SongSettings/MicCheck/Status";
import usePlayerMicStatus from "hooks/players/usePlayerMicStatus";
import player from "Scenes/Game/Singing/Player";

interface Props {
    player: PlayerEntity;
}
export default function SinglePlayer({ player}: Props) {
    const status = usePlayerMicStatus(player.number);

    return (
        <Indicator key={player.number}>
            {player.getName()}
            <Ping playerNumber={player.number} />
            <PlayerStatus status={status} />
            {status !== "unavailable" && <PlayerMicCheck playerNumber={player.number} />}
        </Indicator>
    );
}

const Indicator = styled.div`
    position: relative;
    border: 0.1rem solid white;
    padding: 1rem 3rem;
    background: black;
    width: 80%;

    text-align: center;
    gap: 1.25rem;
    font-size: 2.3rem;
    color: white;
`;
