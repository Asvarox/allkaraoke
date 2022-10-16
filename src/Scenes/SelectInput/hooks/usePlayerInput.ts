import { nextIndex, nextValue } from 'Elements/Switcher';
import { useEffect } from 'react';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { useEventListenerSelector } from 'Scenes/Game/Singing/Hooks/useEventListener';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import InputSources from 'Scenes/SelectInput/InputSources';
import { InputSourceList, InputSourceNames } from 'Scenes/SelectInput/InputSources/interfaces';
import tuple from 'utils/tuple';

export function usePlayerInput(playerNumber: number, sources: Record<InputSourceNames, InputSourceList>) {
    const sourceList = Object.keys(sources) as Array<InputSourceNames>;
    const [selectedPlayerInput, playerInputData] = useEventListenerSelector(
        [events.playerInputChanged, events.inputListChanged],
        () => {
            const playerInput = InputManager.getPlayerInput(playerNumber);

            if (!playerInput) return tuple([null, null]);
            return tuple([playerInput, InputSources.getInputForPlayerSelected(playerInput)]);
        },
    );

    useEffect(() => {
        if (playerInputData === null) {
            const source = sourceList[0];
            const input = sources[source].getDefault();
            if (input) {
                InputManager.setPlayerInput(playerNumber, sourceList[0], input.channel, input.deviceId);
            }
        }
    });

    const cycleSource = () => {
        const nextSource = nextValue(sourceList, selectedPlayerInput?.inputSource ?? sourceList[0]);
        const input = sources[nextSource].getDefault();

        InputManager.setPlayerInput(playerNumber, nextSource, input?.channel, input?.deviceId);
    };
    const cycleInput = () => {
        if (!selectedPlayerInput) return;
        const list = sources[selectedPlayerInput.inputSource].list;
        const currentIndex = playerInputData ? list.findIndex((item) => item.id === playerInputData.id) : 0;
        const input = list[nextIndex(list, currentIndex)];

        InputManager.setPlayerInput(playerNumber, selectedPlayerInput.inputSource, input?.channel, input?.deviceId);
    };

    return tuple([selectedPlayerInput?.inputSource ?? null, cycleSource, playerInputData, cycleInput]);
}
