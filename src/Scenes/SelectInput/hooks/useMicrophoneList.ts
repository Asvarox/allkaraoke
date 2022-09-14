import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { useEventListenerSelector } from 'Scenes/Game/Singing/Hooks/useEventListener';
import inputSourceListManager from 'Scenes/SelectInput/InputSources';
import { InputSource } from 'Scenes/SelectInput/InputSources/interfaces';

export interface SourceInputDefault {
    list: InputSource[];
    getDefault: () => string | null;
}

export type SourceMap = Record<string, SourceInputDefault>;

export function useMicrophoneList() {
    const inputs = useEventListenerSelector(events.inputListChanged, () => inputSourceListManager.getInputList());

    return { inputs, areInputsLoaded: true };
}
