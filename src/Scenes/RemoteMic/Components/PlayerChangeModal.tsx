import styled from '@emotion/styled';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import Modal from 'Elements/Modal';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import React from 'react';

interface Props {
    id: string;
    playerNumber: number | null;
    onModalClose: () => void;
    header?: React.ReactNode;
}

export default function PlayerChangeModal({ playerNumber, id, onModalClose, header }: Props) {
    const selectPlayer = (player: number | null) => {
        WebRTCClient.requestPlayerChange(id, player);
        onModalClose();
    };

    const joined = playerNumber !== null;

    return (
        <Modal onClose={onModalClose}>
            <Menu>
                {header && <h2>{header}</h2>}
                <MenuButton
                    size="small"
                    data-test="change-to-player-0"
                    onClick={() => selectPlayer(0)}
                    disabled={0 === playerNumber}
                    style={{ color: styles.colors.players[0].perfect.fill }}>
                    Blue
                </MenuButton>
                <MenuButton
                    size="small"
                    data-test="change-to-player-1"
                    onClick={() => selectPlayer(1)}
                    disabled={1 === playerNumber}
                    style={{ color: styles.colors.players[1].perfect.fill }}>
                    Red
                </MenuButton>
                <MenuButton
                    size="small"
                    onClick={() => selectPlayer(null)}
                    disabled={!joined}
                    data-test="change-to-unset">
                    Unassign
                </MenuButton>
                <hr />
                <MenuButton onClick={onModalClose} size="small">
                    Close
                </MenuButton>
            </Menu>
        </Modal>
    );
}

const Menu = styled(MenuContainer)`
    gap: 0;
`;
