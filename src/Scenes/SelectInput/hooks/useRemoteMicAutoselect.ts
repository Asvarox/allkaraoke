import events from 'GameEvents/GameEvents';
import { useEventEffect } from 'GameEvents/hooks';
import PlayersManager, { MAX_PLAYERS } from 'Players/PlayersManager';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';
import { useRef } from 'react';

export function useRemoteMicAutoselect() {
  const nextPlayerToAutoSwitch = useRef<0 | 1 | 2 | 3>(0);

  useEventEffect(events.remoteMicConnected, ({ id }) => {
    console.log('useRemoteMicAutoselect', id);
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
