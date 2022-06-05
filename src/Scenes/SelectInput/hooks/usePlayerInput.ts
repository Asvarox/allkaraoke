import usePrevious from 'hooks/usePrevious';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { SourceMap } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import { DummyInputSource } from 'Scenes/SelectInput/InputSources/Dummy';
import { InputSourceNames } from 'Scenes/SelectInput/InputSources/interfaces';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import createPersistedState from 'use-persisted-state';
import tuple from 'utils/tuple';

const useSelectedSources = createPersistedState<Record<number, InputSourceNames | null>>('selectedSources');

function usePersistedSelectedSource(playerNumber: number) {
    const [selectedSources, setSelectedSources] = useSelectedSources({});

    const setPlayerSelectedSource: Dispatch<SetStateAction<InputSourceNames | null>> = (value) => {
        const newValue = value instanceof Function ? value(selectedSources[playerNumber]) : value;

        setSelectedSources((prevState) => ({ ...prevState, [playerNumber]: newValue }));
    };

    return tuple([selectedSources[playerNumber] ?? null, setPlayerSelectedSource]);
}

export function usePlayerInput(playerNumber: number, sourceMap: SourceMap, areInputsLoaded: boolean) {
    const [selectedSource, setSelectedSource] = usePersistedSelectedSource(playerNumber);
    const [selectedInput, setSelectedInput] = useState<string | null>(null);

    const list = selectedSource === null ? [] : sourceMap[selectedSource];

    useEffect(() => {
        if (areInputsLoaded && selectedSource === null) {
            setSelectedSource(
                process.env.NODE_ENV === 'development' ? DummyInputSource.inputName : MicrophoneInputSource.inputName,
            );
        }
    });

    const previousAreInputsLoaded = usePrevious(areInputsLoaded);
    useEffect(() => {
        if (!previousAreInputsLoaded && areInputsLoaded) {
            const multiChannelInputs = list.filter(({ channels }) => channels >= 2);
            if (!multiChannelInputs.length) return;

            setSelectedInput(multiChannelInputs.at(playerNumber)?.id ?? multiChannelInputs.at(-1)!.id);
        }
    }, [playerNumber, previousAreInputsLoaded, areInputsLoaded]);

    useEffect(() => {
        if (!list.length) {
            setSelectedSource(Object.keys(sourceMap)[0] as InputSourceNames);
            setSelectedInput('default;0');
        }
    }, [sourceMap, list]);

    useEffect(() => {
        if (selectedInput === '' || !list?.find((device) => device.id === selectedInput)) {
            setSelectedInput('default;0');
        }
    }, [sourceMap, list]);

    useEffect(() => {
        const input = list?.find((device) => device.id === selectedInput);
        if (input && selectedSource) {
            InputManager.setPlayerInput(playerNumber, selectedSource, input.channel, input.deviceId);
        }
    }, [list, selectedSource, selectedInput]);

    const selectedInputIndex = list?.findIndex((device) => device.id === selectedInput);
    const cycleInputs = () => setSelectedInput(list?.[(selectedInputIndex + 1) % list.length]?.id ?? 'default');

    const cycleSources = () => {
        const sourceList = Object.keys(sourceMap);
        const selectedSourceIndex = sourceList.indexOf(selectedSource!);
        setSelectedSource(sourceList[(selectedSourceIndex + 1) % sourceList.length] as InputSourceNames);
    };

    return tuple([selectedSource, cycleSources, list[selectedInputIndex], cycleInputs]);
}
