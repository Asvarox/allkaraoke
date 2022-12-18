import GameStateEvents from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { useEventEffect } from 'Scenes/Game/Singing/Hooks/useEventListener';
import { useRef } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';

export function useRemoteMicAutoselect() {
    const nextPlayerToAutoSwitch = useRef(0);

    useEventEffect(GameStateEvents.phoneConnected, ({ id }) => {
        console.log('useRemoteMicAutoselect', id);
        InputManager.setPlayerInput(nextPlayerToAutoSwitch.current, RemoteMicrophoneInputSource.inputName, 0, id);
        nextPlayerToAutoSwitch.current = (nextPlayerToAutoSwitch.current + 1) % 2;
    });
}
