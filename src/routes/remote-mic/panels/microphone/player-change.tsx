import { memo, useState } from 'react';

import { BottomSheet } from '~/modules/elements/akui/bottom-sheet';
import { Icon } from '~/modules/elements/akui/icon';
import { MenuButton } from '~/modules/elements/akui/menu/menu-button';
import { PlayerNumber } from '~/modules/players/player-number';
import RemoteMicClient from '~/modules/remote-mic/network/client';
import { useClientHandler } from '~/modules/remote-mic/network/client/hooks/use-client-handler';
import PlayerChangeModal from '~/routes/remote-mic/components/player-change-modal';
import PlayerNumberCircle from '~/routes/remote-mic/components/player-number-circle';

interface Props {
  playerNumber: PlayerNumber | null;
  /** Placement is the caller's — this sits inside the mic pill, which owns its own layout. */
  className?: string;
}

export default memo(function PlayerChange({ playerNumber, className }: Props) {
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
        size="mini"
        className={className}
        onClick={() => setIsOpen(true)}
        data-test="change-player"
        data-joined={joined}
        fullWidth={false}
        leftIcon={joined ? <PlayerNumberCircle number={playerNumber ?? 0} /> : undefined}
        rightIcon={<Icon icon="ic:baseline-swap-horiz" />}>
        {!joined ? 'Join game' : 'Change'}
      </MenuButton>
      <BottomSheet open={isOpen} onClose={closeModal} title="Your color">
        <PlayerChangeModal id={RemoteMicClient.getClientId()!} playerNumber={playerNumber} onModalClose={closeModal} />
      </BottomSheet>
    </>
  );
});
