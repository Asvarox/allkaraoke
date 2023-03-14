import events from 'GameEvents/GameEvents';
import { useEventListenerSelector } from 'GameEvents/hooks';
import inputSourceListManager from 'Scenes/SelectInput/InputSources';
import { InputSource } from 'Scenes/SelectInput/InputSources/interfaces';
import { useEffect } from 'react';

export interface SourceInputDefault {
    list: InputSource[];
    getDefault: () => string | null;
}

export type SourceMap = Record<string, SourceInputDefault>;

export function useMicrophoneList(load = false) {
    const inputs = useEventListenerSelector(events.inputListChanged, () => inputSourceListManager.getInputList());

    useEffect(() => {
        if (load) {
            inputSourceListManager.loadMics();
        }
    }, [load]);

    return inputs;
}
