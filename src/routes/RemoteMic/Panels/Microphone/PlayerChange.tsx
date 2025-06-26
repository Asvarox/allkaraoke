import { SwapHoriz as SwapHorizIcon } from '@mui/icons-material';
import { Button } from 'modules/Elements/AKUI/Button';
import { MenuButton } from 'modules/Elements/AKUI/Menu/MenuButton';
import Modal from 'modules/Elements/Modal';
import events from 'modules/GameEvents/GameEvents';
import { useEventEffect } from 'modules/GameEvents/hooks';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import { memo, useState } from 'react';
import PlayerChangeModal from 'routes/RemoteMic/Components/PlayerChangeModal';
import PlayerNumberCircle from 'routes/RemoteMic/Components/PlayerNumberCircle';

interface Props {
  playerNumber: 0 | 1 | 2 | 3 | null;
  defaultOpen?: boolean;
}

export default memo(function PlayerChange({ playerNumber, defaultOpen = false }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const closeModal = () => setIsOpen(false);

  const joined = playerNumber !== null;

  useEventEffect(
    events.remoteSongSelectionPlayerSettingsOpened,
    () => {
      if (!joined) {
        setIsOpen(true);
      }
    },
    [joined, setIsOpen],
  );

  return (
    <>
      <MenuButton
        size="small"
        className="absolute right-4 bottom-4 z-1 p-4"
        onClick={() => setIsOpen(true)}
        data-test="change-player"
        data-joined={joined}>
        {!joined ? (
          'Join game'
        ) : (
          <>
            <PlayerNumberCircle number={playerNumber} /> Change
          </>
        )}{' '}
        <Button.Icon Icon={SwapHorizIcon} />
      </MenuButton>
      <Modal onClose={closeModal} open={isOpen}>
        {isOpen && (
          <PlayerChangeModal
            header="Your color"
            id={RemoteMicClient.getClientId()!}
            playerNumber={playerNumber}
            onModalClose={closeModal}
          />
        )}
      </Modal>
    </>
  );
});
