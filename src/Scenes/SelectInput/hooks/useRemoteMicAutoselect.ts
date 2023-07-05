import { useEventEffect } from 'GameEvents/hooks';
import { useRef } from 'react';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';
import events from 'GameEvents/GameEvents';
import PlayersManager from 'Players/PlayersManager';

export function useRemoteMicAutoselect() {
    const nextPlayerToAutoSwitch = useRef(0);

    useEventEffect(events.remoteMicConnected, ({ id }) => {
        console.log('useRemoteMicAutoselect', id);
        PlayersManager.getPlayer(nextPlayerToAutoSwitch.current).changeInput(
            RemoteMicrophoneInputSource.inputName,
            0,
            id,
        );
        nextPlayerToAutoSwitch.current = (nextPlayerToAutoSwitch.current + 1) % PlayersManager.getPlayers().length;
    });
}
