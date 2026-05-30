import { SwapHoriz as SwapHorizIcon } from '@mui/icons-material';
import { memo, useState } from 'react';
import { BottomSheet } from '~/modules/elements/akui/bottom-sheet';
import { Button } from '~/modules/elements/akui/button';
import { MenuButton } from '~/modules/elements/akui/menu/menu-button';
import RemoteMicClient from '~/modules/remote-mic/network/client';
import { useClientHandler } from '~/modules/remote-mic/network/client/hooks/use-client-handler';
import PlayerChangeModal from '~/routes/remote-mic/components/player-change-modal';
import PlayerNumberCircle from '~/routes/remote-mic/components/player-number-circle';

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
