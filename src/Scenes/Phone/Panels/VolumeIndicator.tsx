import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';

interface Props {
    volume: number;
    playerNumber: number | null;
    frequency: number | null;
    isMicOn: boolean;
}

export default function VolumeIndicator({ playerNumber, volume, frequency, isMicOn }: Props) {
    const [maxVolume, setMaxVolume] = useState(0.000001);

    useEffect(() => {
        setMaxVolume((current) => (volume > current ? volume : current * 0.99));
    }, [volume]);

    const backgroundColor =
        playerNumber !== null ? styles.colors.players[playerNumber].miss.stroke : styles.colors.lines.normal.fill;
    const indicatorColor =
        playerNumber !== null ? styles.colors.players[playerNumber].perfect.fill : styles.colors.lines.normal.stroke;

    return (
        <IndicatorContainer
            isMicOn={isMicOn}
            color={backgroundColor}
            data-player-number={`${playerNumber ?? 'none'}`}
            data-test="indicator">
            {isMicOn && (
                <>
                    <Frequency>
                        <br />
                        {String(volume * 100).slice(0, 10)}
                    </Frequency>
                    <Frequency>{frequency ? `${Math.round(frequency)}Hz` : ''}</Frequency>
                </>
            )}
            <Indicator
                color={indicatorColor}
                style={{ height: `${isMicOn ? 100 - Math.min(100, (volume / maxVolume) * 100) : 100}%` }}
            />
        </IndicatorContainer>
    );
}

const Frequency = styled.span`
    position: absolute;
    color: white;
    opacity: 0.15;
`;

const Indicator = styled.div<{ color: string }>`
    width: 100%;
    background-color: ${(props) => props.color};
    transition: 200ms;
`;

const IndicatorContainer = styled.div<{ color: string; isMicOn: boolean }>`
    position: relative;
    border: 0.1rem solid white;
    width: 100%;
    aspect-ratio: 1 / 1;
    opacity: ${(props) => (props.isMicOn ? 1 : 0.5)};
    transition: 300ms;

    background: ${(props) => props.color};
`;
