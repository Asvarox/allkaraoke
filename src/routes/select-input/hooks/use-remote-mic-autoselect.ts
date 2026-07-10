import { PlayerNumber } from '~/modules/players/player-number';
import { useRef } from 'react';
import events from '~/modules/game-events/game-events';
import { useEventEffect } from '~/modules/game-events/hooks';
import PlayersManager, { MAX_PLAYERS } from '~/modules/players/players-manager';
import { RemoteMicrophoneInputSource } from '~/routes/select-input/input-sources/remote';

export function useRemoteMicAutoselect() {
  const nextPlayerToAutoSwitch = useRef<PlayerNumber>(0);

  useEventEffect(events.remoteMicConnected, ({ id }) => {
    console.log('useRemoteMicAutoselect', id);
    if (PlayersManager.getInputs().some((input) => input.deviceId === id)) {
      console.log(`Input ${id} already assigned to player`);
      return;
    }
    const player = PlayersManager.getPlayer(nextPlayerToAutoSwitch.current);

    if (player) {
      player.changeInput(RemoteMicrophoneInputSource.inputName, 0, id);
    } else {
      PlayersManager.addPlayer(nextPlayerToAutoSwitch.current)?.changeInput(
        RemoteMicrophoneInputSource.inputName,
        0,
        id,
      );
    }
    nextPlayerToAutoSwitch.current = ((nextPlayerToAutoSwitch.current + 1) % MAX_PLAYERS) as PlayerNumber;
  });
}
