import events from 'GameEvents/GameEvents';
import { useEventListenerSelector } from 'GameEvents/hooks';
import inputSourceListManager from 'Scenes/SelectInput/InputSources';
import { InputSourceNames } from 'Scenes/SelectInput/InputSources/interfaces';
import { useEffect } from 'react';

export function useMicrophoneList(load = false, focus?: InputSourceNames) {
  const inputs = useEventListenerSelector(events.inputListChanged, () => {
    const list = { ...inputSourceListManager.getInputList() };

    if (focus) {
      return { [focus]: list[focus] } as const;
    }

    for (const key in list) {
      if (list[key as InputSourceNames].list.length === 0) {
        delete list[key as InputSourceNames];
      }
    }

    return list;
  });

  useEffect(() => {
    if (load) {
      inputSourceListManager.loadMics();
    }
  }, [load]);

  return inputs;
}
