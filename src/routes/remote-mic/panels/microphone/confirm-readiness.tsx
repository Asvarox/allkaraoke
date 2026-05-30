import { useEffect, useState } from 'react';
import { MenuButton, MenuContainer } from '~/modules/elements/menu';
import events from '~/modules/game-events/game-events';
import { useEventEffect } from '~/modules/game-events/hooks';
import { serverRpc } from '~/modules/remote-mic/network/client';
import storage from '~/modules/utils/storage';
import vibrate from '~/modules/utils/vibrate';

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

  useEffect(() => {
    if (!visible) {
      vibrate(0); // cancel any ongoing vibration
      return;
    }

    vibrate([100, 900, 100, 900, 100]);
    const intervalId = setInterval(() => {
      vibrate([100, 900, 100, 900, 100]);
    }, 3000);

    return () => {
      clearInterval(intervalId);
      vibrate(0);
    };
  }, [visible]);

  useEventEffect(events.remoteReadinessRequested, () => {
    setVisible(true);
  });
  const confirm = () => {
    void serverRpc.input.confirmReadiness();
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
