import events from 'GameEvents/GameEvents';
import { useEventEffect } from 'GameEvents/hooks';
import PlayersManager from 'Players/PlayersManager';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';
import { useRef } from 'react';

export function useRemoteMicAutoselect() {
    const nextPlayerToAutoSwitch = useRef(0);

    useEventEffect(events.remoteMicConnected, ({ id }) => {
        console.log('useRemoteMicAutoselect', id);
        PlayersManager.getPlayer(nextPlayerToAutoSwitch.current)?.changeInput(
            RemoteMicrophoneInputSource.inputName,
            0,
            id,
        );
        nextPlayerToAutoSwitch.current = (nextPlayerToAutoSwitch.current + 1) % PlayersManager.getPlayers().length;
    });
}
