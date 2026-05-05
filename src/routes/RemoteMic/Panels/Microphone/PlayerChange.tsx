import { SwapHoriz as SwapHorizIcon } from '@mui/icons-material';
import { memo, useState } from 'react';
import { BottomSheet } from '~/modules/Elements/AKUI/BottomSheet';
import { Button } from '~/modules/Elements/AKUI/Button';
import { MenuButton } from '~/modules/Elements/AKUI/Menu/MenuButton';
import RemoteMicClient from '~/modules/RemoteMic/Network/Client';
import { useClientHandler } from '~/modules/RemoteMic/Network/Client/hooks/useClientHandler';
import PlayerChangeModal from '~/routes/RemoteMic/Components/PlayerChangeModal';
import PlayerNumberCircle from '~/routes/RemoteMic/Components/PlayerNumberCircle';

interface Props {
  playerNumber: 0 | 1 | 2 | 3 | null;
}

export default memo(function PlayerChange({ playerNumber }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);

  const joined = playerNumber !== null;

  useClientHandler('notifyPlayerSettingsOpen', () => {
    if (!joined) {
      setIsOpen(true);
    }
  });

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
      <BottomSheet open={isOpen} onClose={closeModal} title="Your color">
        <PlayerChangeModal id={RemoteMicClient.getClientId()!} playerNumber={playerNumber} onModalClose={closeModal} />
      </BottomSheet>
    </>
  );
});
