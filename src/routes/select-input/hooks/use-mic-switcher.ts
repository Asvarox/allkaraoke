import { useCallback } from 'react';

import events from '~/modules/game-events/game-events';
import { useEventListenerSelector } from '~/modules/game-events/hooks';
import PlayersManager from '~/modules/players/players-manager';
import { getInputId } from '~/modules/players/utils';
import { nextIndex } from '~/modules/utils/indexes';
import { useMicrophoneList } from '~/routes/select-input/hooks/use-microphone-list';
import inputSourceListManager from '~/routes/select-input/input-sources/index';
import { InputSource } from '~/routes/select-input/input-sources/interfaces';
import { MicrophoneInputSource } from '~/routes/select-input/input-sources/microphone';

/**
 * The single-microphone-for-everyone selection behind the "Mic" switcher, shared by the input setup
 * screen and the pause menus that let you swap devices mid-game. `cycleMic` walks the device list;
 * `selectedMic` is the label to show.
 */
export default function useMicSwitcher() {
  const { Microphone } = useMicrophoneList(true, 'Microphone');

  const selectedMic = useEventListenerSelector([events.playerInputChanged, events.inputListChanged], () => {
    const selected = PlayersManager.getInputs().find((input) => input.source === 'Microphone');
    // The "fresh" list from the manager — the hook's copy can lag right after a device change
    const mics = inputSourceListManager.getInputList().Microphone.list;

    if (selected) {
      return mics.find((mic) => mic.id === getInputId(selected))?.label ?? '';
    }
    return '';
  });

  const setMic = useCallback((input: InputSource) => {
    PlayersManager.getPlayers().forEach((player) =>
      player.changeInput(MicrophoneInputSource.inputName, input.channel, input.deviceId),
    );
  }, []);

  const cycleMic = useCallback(() => {
    const currentIndex = Microphone.list.findIndex((mic) => mic.label === selectedMic);

    if (currentIndex > -1) {
      setMic(Microphone.list[nextIndex(Microphone.list, currentIndex)]);
    }
  }, [Microphone, selectedMic, setMic]);

  return { Microphone, selectedMic, setMic, cycleMic };
}
