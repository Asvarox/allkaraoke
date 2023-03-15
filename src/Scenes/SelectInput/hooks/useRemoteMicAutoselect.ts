import { useEventEffect } from 'GameEvents/hooks';
import { useRef } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';
import events from 'GameEvents/GameEvents';

export function useRemoteMicAutoselect() {
    const nextPlayerToAutoSwitch = useRef(0);

    useEventEffect(events.remoteMicConnected, ({ id }) => {
        console.log('useRemoteMicAutoselect', id);
        InputManager.setPlayerInput(nextPlayerToAutoSwitch.current, RemoteMicrophoneInputSource.inputName, 0, id);
        nextPlayerToAutoSwitch.current = (nextPlayerToAutoSwitch.current + 1) % 2;
    });
}
