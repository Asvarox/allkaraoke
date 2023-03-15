import styled from '@emotion/styled';
import { useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { focused, typography } from 'Elements/cssMixins';
import { buttonFocused } from 'Elements/Button';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import Modal from 'Elements/Modal';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';

interface Props {
    playerNumber: number | null;
}

export default function PlayerChange({ playerNumber }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const closeModal = () => setIsOpen(false);

    const selectPlayer = (player: number | null) => {
        WebRTCClient.requestPlayerChange(player);
        closeModal();
    };

    return (
        <>
            <PlayerChangeContainer onClick={() => setIsOpen(true)} data-test="change-player">
                {playerNumber === null ? 'Join game' : 'Change'} <SwapHorizIcon />
            </PlayerChangeContainer>
            {isOpen && (
                <Modal onClose={closeModal}>
                    <MenuContainer>
                        <MenuButton
                            data-test="change-to-player-1"
                            onClick={() => selectPlayer(0)}
                            disabled={0 === playerNumber}
                            style={{ color: styles.colors.players[0].perfect.fill }}>
                            Blue
                        </MenuButton>
                        <MenuButton
                            data-test="change-to-player-2"
                            onClick={() => selectPlayer(1)}
                            disabled={1 === playerNumber}
                            style={{ color: styles.colors.players[1].perfect.fill }}>
                            Red
                        </MenuButton>
                        <MenuButton
                            onClick={() => selectPlayer(null)}
                            disabled={null === playerNumber}
                            data-test="change-to-unset">
                            Unassign
                        </MenuButton>
                        <hr />
                        <MenuButton onClick={closeModal}>Close</MenuButton>
                    </MenuContainer>
                </Modal>
            )}
        </>
    );
}

const PlayerChangeContainer = styled.button`
    position: absolute;
    color: white;
    right: 1rem;
    top: 1rem;
    padding: 1rem;
    font-size: 2rem;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: none;
    ${typography};
    background: rgba(0, 0, 0, 0.75);

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
