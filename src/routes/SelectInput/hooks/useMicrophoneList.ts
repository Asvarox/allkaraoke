import events from 'modules/GameEvents/GameEvents';
import { useEventListenerSelector } from 'modules/GameEvents/hooks';
import { useEffect } from 'react';
import inputSourceListManager from 'routes/SelectInput/InputSources';
import { InputSourceNames } from 'routes/SelectInput/InputSources/interfaces';

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
