import { css } from '@emotion/react';
import styled from '@emotion/styled';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { buttonFocused } from 'Elements/Button';
import { focused, typography } from 'Elements/cssMixins';
import RemoteMicClient from 'RemoteMic/Network/Client';
import PlayerChangeModal from 'Scenes/RemoteMic/Components/PlayerChangeModal';
import PlayerNumberCircle from 'Scenes/RemoteMic/Components/PlayerNumberCircle';
import { memo, useState } from 'react';

interface Props {
    playerNumber: number | null;
}

export default memo(function PlayerChange({ playerNumber }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const closeModal = () => setIsOpen(false);

    const joined = playerNumber !== null;

    return (
        <>
            <PlayerChangeContainer onClick={() => setIsOpen(true)} data-test="change-player" joined={joined}>
                {!joined ? (
                    'Join game'
                ) : (
                    <>
                        <PlayerNumberCircle number={playerNumber} /> Change
                    </>
                )}{' '}
                <SwapHorizIcon />
            </PlayerChangeContainer>
            {isOpen && (
                <PlayerChangeModal
                    id={RemoteMicClient.getClientId()!}
                    playerNumber={playerNumber}
                    onModalClose={closeModal}
                />
            )}
        </>
    );
});

const PlayerChangeContainer = styled.button<{ joined: boolean }>`
    position: absolute;
    z-index: 1;
    color: white;
    right: 1rem;
    bottom: 1rem;
    padding: 1rem;
    font-size: 2rem;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: none;
    ${typography};
    background: rgba(0, 0, 0, 0.75);

    ${(props) =>
        !props.joined &&
        css`
            font-size: 3rem;
            padding: 3rem;
            ${focused}
        `}

    :hover {
        ${focused};
    }

    :active {
        ${buttonFocused};
    }

    svg {
        width: 2rem;
        height: 2rem;
    }
`;
