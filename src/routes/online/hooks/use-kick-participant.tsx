import { useState } from 'react';

import ConfirmModal from '~/modules/elements/akui/confirm-modal';
import { trackOnlinePlayerKicked } from '~/modules/online/client/online-analytics';
import OnlineClient from '~/modules/online/client/online-client';
import { OnlineParticipant } from '~/modules/online/protocol/types';

/**
 * The host's "remove a singer" flow, identical wherever it's offered (lobby, pause menu): pick a
 * target, confirm, kick. Render `kickModal` somewhere in the screen and gate any keyboard nav on
 * `isKicking`, so the confirmation owns the keyboard while it's up.
 */
export default function useKickParticipant() {
  const [kickTarget, setKickTarget] = useState<OnlineParticipant | null>(null);

  const confirmKick = () => {
    if (kickTarget) {
      OnlineClient.send.room.kickPlayer(kickTarget.id);
      trackOnlinePlayerKicked();
    }
    setKickTarget(null);
  };

  return {
    isKicking: kickTarget !== null,
    requestKick: setKickTarget,
    kickModal: (
      <ConfirmModal
        open={kickTarget !== null}
        onClose={() => setKickTarget(null)}
        title={`Remove ${kickTarget?.name}?`}
        description="They will be removed from the room and won't be able to rejoin."
        cancelLabel="Cancel"
        confirmLabel="Remove"
        dataTestPrefix="online-kick-confirm"
        cancelButtonProps={{ onClick: () => setKickTarget(null) }}
        confirmButtonProps={{ onClick: confirmKick }}
      />
    ),
  };
}
