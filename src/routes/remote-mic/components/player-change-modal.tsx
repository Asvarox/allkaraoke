import { Button } from '~/modules/elements/akui/button';
import { PlayerColorPicker } from '~/modules/elements/player-color-picker';
import { LOCAL_PLAYER_NUMBERS, PlayerNumber } from '~/modules/players/player-number';
import { serverRpc } from '~/modules/remote-mic/network/client';
import { useSubscription } from '~/modules/remote-mic/network/client/hooks/use-subscription';

interface Props {
  id: string;
  playerNumber: PlayerNumber | null;
  onModalClose: () => void;
  showRemoveButton?: boolean;
}

export default function PlayerChangeModal({ playerNumber, id, onModalClose, showRemoveButton = false }: Props) {
  const list = useSubscription('remote-mics') ?? [];
  // The phone has no settings of its own to read the theme from — it only knows what the game told it.
  const style = useSubscription('style') ?? 'regular';
  const selectPlayer = (player: PlayerNumber | null) => {
    void serverRpc.players.requestMicSelect(id, player);
    onModalClose();
  };

  const joined = playerNumber !== null;

  const occupants: Partial<Record<PlayerNumber, string>> = {};
  for (const mic of list) {
    if (mic.number !== null) occupants[mic.number] ??= mic.name;
  }

  return (
    <PlayerColorPicker
      theme={style}
      playerNumbers={LOCAL_PLAYER_NUMBERS}
      selected={playerNumber}
      occupants={occupants}
      onPick={selectPlayer}
      onPickSelected={onModalClose}
      testIdPrefix="change-to-player"
      occupantTestId="mic-occupant">
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
    </PlayerColorPicker>
  );
}
