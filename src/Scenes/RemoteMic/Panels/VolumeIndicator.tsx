import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import PlayerChange from 'Scenes/RemoteMic/Panels/PlayerChange';

interface Props {
    volume: number;
    playerNumber: number | null;
    frequency: number | null;
    isMicOn: boolean;
    isConnected: boolean;
}

export default function VolumeIndicator({ playerNumber, volume, frequency, isMicOn, isConnected }: Props) {
    const [maxVolume, setMaxVolume] = useState(0.000001);

    useEffect(() => {
        setMaxVolume((current) => (volume > current ? volume : current * 0.99));
    }, [volume]);

    const backgroundColor =
        playerNumber !== null ? styles.colors.players[playerNumber].miss.stroke : styles.colors.lines.normal.fill;
    const indicatorColor =
        playerNumber !== null ? styles.colors.players[playerNumber].perfect.fill : styles.colors.lines.normal.fill;

    return (
        <IndicatorContainer
            isMicOn={isMicOn}
            color={backgroundColor}
            data-player-number={`${playerNumber ?? 'none'}`}
            data-test="indicator">
            {isMicOn && (
                <>
                    <Debug>
                        {frequency ? `${Math.round(frequency)}Hz` : ' '}
                        <br />
                        {String(volume * 100).slice(0, 5)}
                    </Debug>
                </>
            )}
            {isConnected && <PlayerChange playerNumber={playerNumber} />}
            <Indicator
                color={indicatorColor}
                style={{ height: `${isMicOn ? 100 - Math.min(100, (volume / maxVolume) * 100) : 100}%` }}
            />
        </IndicatorContainer>
    );
}

const Debug = styled.span`
    position: absolute;
    color: white;
    opacity: 0.125;
`;

const Indicator = styled.div<{ color: string }>`
    width: 100%;
    background-color: ${(props) => props.color};
    transition: 200ms;
`;

const IndicatorContainer = styled.div<{ color: string; isMicOn: boolean }>`
    position: relative;
    border: 0.1rem solid white;
    flex: 1;
    min-height: 200px;
    max-height: 100vw;
    transition: 300ms;

    background: ${(props) => props.color};
`;
