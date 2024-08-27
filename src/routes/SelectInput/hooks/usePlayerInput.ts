import { nextIndex, nextValue } from 'modules/Elements/Switcher';
import events from 'modules/GameEvents/GameEvents';
import { useEventListenerSelector } from 'modules/GameEvents/hooks';
import PlayersManager from 'modules/Players/PlayersManager';
import tuple from 'modules/utils/tuple';
import { useEffect } from 'react';
import InputSources from 'routes/SelectInput/InputSources';
import { InputSourceList, InputSourceNames } from 'routes/SelectInput/InputSources/interfaces';

export function usePlayerInput(playerNumber: 0 | 1 | 2 | 3, sources: Record<string, InputSourceList>) {
  const sourceList = Object.keys(sources) as Array<InputSourceNames>;
  const [selectedPlayerInput, playerInputData, isPlayerInputInitialised] = useEventListenerSelector(
    [events.playerInputChanged, events.inputListChanged],
    () => {
      const playerInput = PlayersManager.getPlayer(playerNumber)?.input;

      if (!playerInput) return tuple([null, null, true]);
      return tuple([
        playerInput,
        InputSources.getInputForPlayerSelected(playerInput),
        InputSources.isPlayerInputInitialised(playerInput),
      ]);
    },
  );

  useEffect(() => {
    if (isPlayerInputInitialised && playerInputData === null) {
      const source = sourceList[0];
      const input = sources[source].getDefault();
      if (input) {
        PlayersManager.getPlayer(playerNumber)?.changeInput(sourceList[0], input.channel, input.deviceId);
      }
    }
  });

  const cycleSource = (startingIndex?: number) => {
    const nextSource = nextValue(sourceList, selectedPlayerInput?.source ?? sourceList[0]);

    const input =
      startingIndex !== undefined ? sources[nextSource].list[startingIndex] : sources[nextSource].getDefault();

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

      PlayersManager.getPlayer(playerNumber)?.changeInput(selectedPlayerInput.source, input?.channel, input?.deviceId);
    }
  };

  return tuple([selectedPlayerInput?.source ?? null, cycleSource, playerInputData, cycleInput]);
}
