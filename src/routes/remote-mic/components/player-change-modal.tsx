import { Button } from '~/modules/elements/akui/button';
import { backgroundTheme } from '~/modules/elements/layout-with-background';
import styles from '~/modules/game-engine/drawing/styles';
import { serverRpc } from '~/modules/remote-mic/network/client';
import { useSubscription } from '~/modules/remote-mic/network/client/hooks/use-subscription';

interface Props {
  id: string;
  playerNumber: 0 | 1 | 2 | 3 | null;
  onModalClose: () => void;
  showRemoveButton?: boolean;
}

const colorNames: Record<backgroundTheme, string[]> = {
  regular: ['Blue', 'Red', 'Green', 'Yellow'],
  christmas: ['Green', 'Red', 'Blue', 'Gold'],
  eurovision: ['Blue', 'Red', 'Green', 'Pink'],
  halloween: ['Orange', 'Violet', 'Red', 'Green'],
};

export default function PlayerChangeModal({ playerNumber, id, onModalClose, showRemoveButton = false }: Props) {
  const list = useSubscription('remote-mics') ?? [];
  const style = useSubscription('style') ?? 'regular';
  const selectPlayer = (player: 0 | 1 | 2 | 3 | null) => {
    void serverRpc.players.requestMicSelect(id, player);
    onModalClose();
  };

  const joined = playerNumber !== null;

  return (
    <div className="flex flex-col gap-2 pb-2">
      {([0, 1, 2, 3] as const).map((number) => {
        const occupant = list.find((mic) => mic.number === number);
        const isOwn = number === playerNumber;

        return (
          <Button
            key={number}
            size="small"
            data-test={`change-to-player-${number}`}
            onClick={isOwn ? onModalClose : () => selectPlayer(number)}
            // disabled={isOwn}
            data-focused={isOwn}
            className="gap-2"
            style={{ color: styles.colors.players[number].perfect.fill }}>
            {colorNames[style][number]}
            {isOwn || occupant ? (
              <span className="text-sm text-gray-300" data-test="mic-occupant">
                {' '}
                ({isOwn ? 'You' : occupant?.name})
              </span>
            ) : (
              ''
            )}
          </Button>
        );
      })}
      <Button size="small" onClick={() => selectPlayer(null)} disabled={!joined} data-test="change-to-unset">
        Unassign
      </Button>
      <hr />
      {showRemoveButton && (
        <Button size="small" onClick={() => void serverRpc.players.removePlayer(id)} data-test="remove-player">
          Remove
        </Button>
      )}
      <Button onClick={onModalClose} size="small" data-test="close-menu">
        Close
      </Button>
    </div>
  );
}
