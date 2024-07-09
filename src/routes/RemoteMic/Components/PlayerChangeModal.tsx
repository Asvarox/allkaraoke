import styled from '@emotion/styled';
import { MenuButton, MenuContainer } from 'modules/Elements/Menu';
import Modal from 'modules/Elements/Modal';
import styles from 'modules/GameEngine/Drawing/styles';
import gameEvents from 'modules/GameEvents/GameEvents';
import { useEventListener } from 'modules/GameEvents/hooks';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import React from 'react';

interface Props {
  id: string;
  playerNumber: 0 | 1 | 2 | 3 | null;
  onModalClose: () => void;
  header?: React.ReactNode;
}

export default function PlayerChangeModal({ playerNumber, id, onModalClose, header }: Props) {
  const [style] = useEventListener(gameEvents.remoteStyleChanged, true) ?? ['regular'];
  const selectPlayer = (player: 0 | 1 | 2 | 3 | null) => {
    RemoteMicClient.requestPlayerChange(id, player);
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
          {style === 'christmas' ? 'Green' : style === 'eurovision' ? 'Blue' : 'Blue'}
        </MenuButton>
        <MenuButton
          size="small"
          data-test="change-to-player-1"
          onClick={() => selectPlayer(1)}
          disabled={1 === playerNumber}
          style={{ color: styles.colors.players[1].perfect.fill }}>
          {style === 'christmas' ? 'Red' : style === 'eurovision' ? 'Violet' : 'Red'}
        </MenuButton>
        <MenuButton
          size="small"
          data-test="change-to-player-2"
          onClick={() => selectPlayer(2)}
          disabled={2 === playerNumber}
          style={{ color: styles.colors.players[2].perfect.fill }}>
          {style === 'christmas' ? '?????' : style === 'eurovision' ? 'Yellow' : 'Green'}
        </MenuButton>
        <MenuButton
          size="small"
          data-test="change-to-player-3"
          onClick={() => selectPlayer(3)}
          disabled={3 === playerNumber}
          style={{ color: styles.colors.players[3].perfect.fill }}>
          {style === 'christmas' ? '?????' : style === 'eurovision' ? 'Pink' : 'Yellow'}
        </MenuButton>
        <MenuButton size="small" onClick={() => selectPlayer(null)} disabled={!joined} data-test="change-to-unset">
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
