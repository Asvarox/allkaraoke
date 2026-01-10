import { MenuButton, MenuContainer } from 'modules/Elements/Menu';
import events from 'modules/GameEvents/GameEvents';
import { useEventEffect } from 'modules/GameEvents/hooks';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import storage from 'modules/utils/storage';
import { useEffect, useState } from 'react';

interface Props {
  onConfirm: () => void;
}

function ConfirmReadiness({ onConfirm }: Props) {
  const [visible, setVisible] = useState(false);
  const [isAfterReload, setIsAfterReload] = useState(false);

  // Try to predict the readiness request from the game. If the refresh request happened and after reconnection
  // The player number is set for the phone, it's likely that a readiness confirmation is needed so the button
  // is displayed even before the event comes around
  useEffect(() => {
    if (storage.session.getItem('reload-mic-request') !== null) {
      setIsAfterReload(true);
    }
  }, []);
  useEventEffect(events.remoteMicPlayerSet, () => {
    if (isAfterReload) {
      setIsAfterReload(false);
      setVisible(true);
    }
  });

  useEventEffect(events.remoteReadinessRequested, () => {
    setVisible(true);
  });
  const confirm = () => {
    RemoteMicClient.confirmReadiness();
    setVisible(false);
    onConfirm();
  };

  return visible ? (
    <div className="animate-blink absolute inset-0 z-[1000] flex flex-col items-center justify-center backdrop-blur-md">
      <MenuContainer>
        <MenuButton className="animate-focused aspect-square" data-test="ready-button" onClick={confirm}>
          Ready
        </MenuButton>
      </MenuContainer>
    </div>
  ) : null;
}
export default ConfirmReadiness;
