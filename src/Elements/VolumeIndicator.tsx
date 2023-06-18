import styled from '@emotion/styled';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import usePlayerMic from 'hooks/players/usePlayerMic';

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
    const [volume] = usePlayerMic(playerNumber);

    return <VolumeIndicator {...props} playerNumber={playerNumber} volume={volume} />;
};
