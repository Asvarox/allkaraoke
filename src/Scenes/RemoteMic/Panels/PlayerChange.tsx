import styled from '@emotion/styled';
import { memo, useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { focused, typography } from 'Elements/cssMixins';
import { buttonFocused } from 'Elements/Button';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import Modal from 'Elements/Modal';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import { css } from '@emotion/react';

interface Props {
    playerNumber: number | null;
}

export default memo(function PlayerChange({ playerNumber }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    console.log(playerNumber);

    const closeModal = () => setIsOpen(false);

    const selectPlayer = (player: number | null) => {
        WebRTCClient.requestPlayerChange(player);
        closeModal();
    };

    const joined = playerNumber !== null;

    return (
        <>
            <PlayerChangeContainer onClick={() => setIsOpen(true)} data-test="change-player" joined={joined}>
                {!joined ? (
                    'Join game'
                ) : (
                    <>
                        <PlayerColorCircle style={{ background: styles.colors.players[playerNumber].perfect.fill }} />{' '}
                        Change
                    </>
                )}{' '}
                <SwapHorizIcon />
            </PlayerChangeContainer>
            {isOpen && (
                <Modal onClose={closeModal}>
                    <Menu>
                        <MenuButton
                            data-test="change-to-player-0"
                            onClick={() => selectPlayer(0)}
                            disabled={0 === playerNumber}
                            style={{ color: styles.colors.players[0].perfect.fill }}>
                            Blue
                        </MenuButton>
                        <MenuButton
                            data-test="change-to-player-1"
                            onClick={() => selectPlayer(1)}
                            disabled={1 === playerNumber}
                            style={{ color: styles.colors.players[1].perfect.fill }}>
                            Red
                        </MenuButton>
                        <MenuButton onClick={() => selectPlayer(null)} disabled={!joined} data-test="change-to-unset">
                            Unassign
                        </MenuButton>
                        <hr />
                        <MenuButton onClick={closeModal}>Close</MenuButton>
                    </Menu>
                </Modal>
            )}
        </>
    );
});

const Menu = styled(MenuContainer)`
    gap: 0;
`;

const PlayerColorCircle = styled.div`
    display: inline-block;
    width: 1em;
    height: 1em;
    border-radius: 1em;
`;

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
