import { useEffect } from 'react';

import events from '~/modules/game-events/game-events';
import { useEventListenerSelector } from '~/modules/game-events/hooks';
import inputSourceListManager from '~/routes/select-input/input-sources/index';
import { InputSourceNames } from '~/routes/select-input/input-sources/interfaces';

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
