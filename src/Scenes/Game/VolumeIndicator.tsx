import styled from '@emotion/styled';
import { ReactNode, useEffect, useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { FPSCountSetting } from 'Scenes/Settings/SettingsState';

interface Props {
    playerNumber: number;
    children: ReactNode;
}

export default function VolumeIndicator({ playerNumber, children }: Props) {
    const [volume, setVolume] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const playerVolume = InputManager.getPlayerVolume(playerNumber) ?? 0;
            setVolume(playerVolume);
        }, 1000 / FPSCountSetting.get());

        return () => {
            clearInterval(interval);
        };
    }, [playerNumber]);

    return (
        <Indicator volume={volume} color={styles.colors.players[playerNumber].hit.fill}>
            {children}
        </Indicator>
    );
}

const Indicator = styled.div<{ volume: number; color: string }>`
    border: 1px solid white;
    padding: 10px 30px;

    transition: 300ms;

    background: ${(props) => (props.volume > 0.025 ? props.color : 'black')};
`;
