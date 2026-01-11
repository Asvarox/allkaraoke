import { useRef } from 'react';
import events from '~/modules/GameEvents/GameEvents';
import { useEventEffect } from '~/modules/GameEvents/hooks';
import PlayersManager, { MAX_PLAYERS } from '~/modules/Players/PlayersManager';
import { RemoteMicrophoneInputSource } from '~/routes/SelectInput/InputSources/Remote';

export function useRemoteMicAutoselect() {
  const nextPlayerToAutoSwitch = useRef<0 | 1 | 2 | 3>(0);

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
    nextPlayerToAutoSwitch.current = ((nextPlayerToAutoSwitch.current + 1) % MAX_PLAYERS) as 0 | 1 | 2 | 3;
  });
}
