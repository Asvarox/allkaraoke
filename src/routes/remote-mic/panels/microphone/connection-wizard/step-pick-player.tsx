import { BottomSheet } from '~/modules/elements/akui/bottom-sheet';
import events from '~/modules/game-events/game-events';
import { useEventListener } from '~/modules/game-events/hooks';
import RemoteMicClient from '~/modules/remote-mic/network/client';
import PlayerChangeModal from '~/routes/remote-mic/components/player-change-modal';

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
