import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { FPSCountSetting } from 'Scenes/Settings/SettingsState';

const VolumeIndicatorBase = styled.div<{ color: string }>`
    background: linear-gradient(270deg, rgba(${(props) => props.color}, 1) 0%, rgba(${(props) => props.color}, 0) 100%);
    height: 100%;
    width: 100%;
    position: absolute;
    right: 0;
    top: 0;
    background-repeat: repeat-y;
    transform-origin: right;
    z-index: 1;
    pointer-events: none;
`;

export const VolumeIndicator = ({ volume, playerNumber, ...rest }: { playerNumber: number; volume: number }) => {
    const percent = `${Math.min(1, volume * 20)}`;
    const color = styles.colors.players[playerNumber].text;

    return <VolumeIndicatorBase color={color} {...rest} style={{ transform: `scaleX(${percent})` }} />;
};

export const PlayerMicCheck = ({ playerNumber, ...props }: { playerNumber: number }) => {
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

    return <VolumeIndicator {...props} playerNumber={playerNumber} volume={volume} />;
};
