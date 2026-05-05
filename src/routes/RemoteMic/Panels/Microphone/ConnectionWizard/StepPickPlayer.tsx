import { BottomSheet } from '~/modules/Elements/AKUI/BottomSheet';
import events from '~/modules/GameEvents/GameEvents';
import { useEventListener } from '~/modules/GameEvents/hooks';
import RemoteMicClient from '~/modules/RemoteMic/Network/Client';
import PlayerChangeModal from '~/routes/RemoteMic/Components/PlayerChangeModal';

interface Props {
  onComplete: () => void;
}

export default function StepPickPlayer({ onComplete }: Props) {
  const [playerNumber] = useEventListener(events.remoteMicPlayerSet, true) ?? [null];

  return (
    <BottomSheet open={true} onClose={onComplete} title="Choose your color">
      <PlayerChangeModal id={RemoteMicClient.getClientId()!} playerNumber={playerNumber} onModalClose={onComplete} />
    </BottomSheet>
  );
}
