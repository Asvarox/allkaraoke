import styled from '@emotion/styled';
import PlayersManager from 'Players/PlayersManager';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { usePlayerMicData } from 'hooks/players/usePlayerMic';
import { ForwardedRef, forwardRef, useCallback, useState } from 'react';

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

export const VolumeIndicator = forwardRef(
    (
        { volume, playerNumber, ...rest }: { playerNumber: number; volume: number },
        ref: ForwardedRef<HTMLDivElement | null>,
    ) => {
        const player = PlayersManager.getPlayer(playerNumber);
        const percent = `${Math.min(1, volume * 20)}`;
        const color = styles.colors.players[player.number].text;

        return <VolumeIndicatorBase color={color} {...rest} style={{ transform: `scaleX(${percent})` }} ref={ref} />;
    },
);

export const PlayerMicCheck = ({ playerNumber, ...props }: { playerNumber: number }) => {
    const [elem, setElem] = useState<HTMLDivElement | null>();

    const cb = useCallback(
        ([volume]: [number, number]) => {
            if (elem) {
                const percent = `${Math.min(1, volume * 20)}`;

                elem.style.transform = `scaleX(${percent})`;
            }
        },
        [elem],
    );

    usePlayerMicData(playerNumber, undefined, cb);
    const color = styles.colors.players[playerNumber].text;

    return <VolumeIndicatorBase {...props} color={color} ref={setElem} />;
};
