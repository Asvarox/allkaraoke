import { nextIndex, nextValue } from 'Elements/Switcher';
import events from 'GameEvents/GameEvents';
import { useEventListenerSelector } from 'GameEvents/hooks';
import PlayersManager from 'Players/PlayersManager';
import InputSources from 'Scenes/SelectInput/InputSources';
import { InputSourceList, InputSourceNames } from 'Scenes/SelectInput/InputSources/interfaces';
import { useEffect } from 'react';
import tuple from 'utils/tuple';

export function usePlayerInput(playerNumber: number, sources: Record<InputSourceNames, InputSourceList>) {
    const sourceList = Object.keys(sources) as Array<InputSourceNames>;
    const [selectedPlayerInput, playerInputData] = useEventListenerSelector(
        [events.playerInputChanged, events.inputListChanged],
        () => {
            const playerInput = PlayersManager.getPlayer(playerNumber)?.input;

            if (!playerInput) return tuple([null, null]);
            return tuple([playerInput, InputSources.getInputForPlayerSelected(playerInput)]);
        },
    );

    useEffect(() => {
        if (playerInputData === null) {
            const source = sourceList[0];
            const input = sources[source].getDefault();
            if (input) {
                PlayersManager.getPlayer(playerNumber)?.changeInput(sourceList[0], input.channel, input.deviceId);
            }
        }
    });

    const cycleSource = (startingIndex?: number) => {
        const nextSource = nextValue(sourceList, selectedPlayerInput?.source ?? sourceList[0]);

        const input = startingIndex ? sources[nextSource].list[startingIndex] : sources[nextSource].getDefault();

        PlayersManager.getPlayer(playerNumber)?.changeInput(nextSource, input?.channel, input?.deviceId);
    };
    const cycleInput = () => {
        if (!selectedPlayerInput) return;
        const list = sources[selectedPlayerInput.source].list;
        const currentIndex = playerInputData ? list.findIndex((item) => item.id === playerInputData.id) : 0;
        const newIndex = nextIndex(list, currentIndex);
        if (newIndex === 0) {
            cycleSource(0);
        } else {
            const input = list[newIndex];

            PlayersManager.getPlayer(playerNumber)?.changeInput(
                selectedPlayerInput.source,
                input?.channel,
                input?.deviceId,
            );
        }
    };

    return tuple([selectedPlayerInput?.source ?? null, cycleSource, playerInputData, cycleInput]);
}
