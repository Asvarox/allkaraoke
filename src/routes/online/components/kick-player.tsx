import ConfirmModal from '~/modules/elements/akui/confirm-modal';
import { Icon } from '~/modules/elements/akui/icon';
import { trackOnlinePlayerKicked } from '~/modules/online/client/online-analytics';
import OnlineClient from '~/modules/online/client/online-client';
import { OnlineParticipant } from '~/modules/online/protocol/types';

interface Props {
  participant: OnlineParticipant;
}

/**
 * The host's "remove a singer" control, identical wherever it's offered (lobby, pause menu): the
 * button, the confirmation it opens and the kick itself. Drop it on a singer's row — whether the
 * confirmation is up is the modal's business, and it pauses the surrounding screen's keyboard
 * navigation on its own.
 */
export default function KickPlayer({ participant }: Props) {
  const kick = () => {
    OnlineClient.send.room.kickPlayer(participant.id);
    trackOnlinePlayerKicked();
  };

  return (
    <ConfirmModal
      title={`Remove ${participant.name}?`}
      description="They will be removed from the room and won't be able to rejoin."
      onConfirm={kick}
      dataTestPrefix="online-kick-confirm"
      cancelButton={<ConfirmModal.CancelButton name="cancel-kick-participant">Cancel</ConfirmModal.CancelButton>}
      confirmButton={<ConfirmModal.ConfirmButton name="confirm-kick-participant">Remove</ConfirmModal.ConfirmButton>}>
      <button
        type="button"
        title={`Remove ${participant.name} from the room`}
        className="flex cursor-pointer items-center opacity-75 hover:text-red-400 hover:opacity-100"
        data-test={`online-kick-${participant.playerNumber}`}>
        <Icon icon="ic:baseline-close" className="h-5 w-5" />
      </button>
    </ConfirmModal>
  );
}
