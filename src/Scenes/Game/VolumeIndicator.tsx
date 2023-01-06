import styled from '@emotion/styled';
import { ReactNode, useEffect, useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { FPSCountSetting } from 'Scenes/Settings/SettingsState';

interface Props {
    playerNumber: number;
    children: ReactNode;
}

export default function VolumeIndicator({ playerNumber, children, ...props }: Props) {
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
        <Indicator volume={volume} color={styles.colors.players[playerNumber].hit.fill} {...props}>
            {children}
        </Indicator>
    );
}

const Indicator = styled.div<{ volume: number; color: string }>`
    border: 0.1rem solid white;
    padding: 1rem 3rem;

    transition: 300ms;

    background: ${(props) => (props.volume > 0.025 ? props.color : 'black')};
    text-align: center;
    gap: 1.25rem;
    font-size: 2.3rem;
    color: white;

    svg {
        transition: 300ms;
        opacity: ${(props) => (props.volume > 0.025 ? 1 : 0.5)};
    }
`;
