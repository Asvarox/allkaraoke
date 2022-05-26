import { MenuButton, MenuContainer } from 'Elements/Menu';
import { navigate } from 'hooks/useHashLocation';
import useKeyboardNav from 'hooks/useKeyboardNav';
import usePrevious from 'hooks/usePrevious';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import sources from 'Scenes/SelectInput/InputSources';
import { DummyInputSource } from 'Scenes/SelectInput/InputSources/Dummy';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import createPersistedState from 'use-persisted-state';
import tuple from '../../utils/tuple';
import { Switcher } from '../Game/SongSelection/Switcher';
import { InputSource, InputSourceNames } from './InputSources/interfaces';

interface Props {
    // file?: string;
}

type SourceMap = Record<string, InputSource[]>;

const initialState: SourceMap = sources.reduce<SourceMap>(
    (acc, elem) => ({
        ...acc,
        [elem.inputName]: [],
    }),
    {},
);

function useMicrophoneList(onEnumerate?: (inputs: MediaDeviceInfo[]) => void) {
    const [inputs, setInputs] = useState(initialState);
    const [isLoaded, setIsLoaded] = useState(false);

    const enumerateDevices = () => {
        Promise.all(sources.map((source) => source.getInputs()))
            .then((inputs) =>
                inputs.reduce(
                    (acc, elem, index) => ({
                        ...acc,
                        [sources[index].inputName]: elem,
                    }),
                    {},
                ),
            )
            .then((inputs) => {
                setInputs(inputs);
                setIsLoaded(true);
            });
    };

    useEffect(() => {
        enumerateDevices();
    }, []);

    useEffect(() => {
        sources.forEach((source) => source.subscribeToListChange(enumerateDevices));

        return () => sources.forEach((source) => source.unsubscribeToListChange(enumerateDevices));
    });

    return { inputs, areInputsLoaded: isLoaded };
}

const useSelectedSources = createPersistedState<Record<number, InputSourceNames | null>>('selectedSources');

function usePersistedSelectedSource(playerNumber: number) {
    const [selectedSources, setSelectedSources] = useSelectedSources({});

    const setPlayerSelectedSource: Dispatch<SetStateAction<InputSourceNames | null>> = (value) => {
        const newValue = value instanceof Function ? value(selectedSources[playerNumber]) : value;

        setSelectedSources((prevState) => ({ ...prevState, [playerNumber]: newValue }));
    };

    return tuple([selectedSources[playerNumber] ?? null, setPlayerSelectedSource]);
}

function usePlayerInput(playerNumber: number, sourceMap: SourceMap, areInputsLoaded: boolean) {
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

function SelectInput(props: Props) {
    const { inputs, areInputsLoaded } = useMicrophoneList();

    const [p1Source, p1CycleSource, p1Input, p1CycleInput] = usePlayerInput(0, inputs, areInputsLoaded);
    const [p2Source, p2CycleSource, p2Input, p2CycleInput] = usePlayerInput(1, inputs, areInputsLoaded);

    const goBack = () => navigate('/');

    const { register } = useKeyboardNav({ onBackspace: goBack });

    if (!areInputsLoaded) return <>Loading available voice inputs...</>;

    return (
        <MenuContainer>
            <h1>Setup players</h1>
            <h2>Player 1</h2>
            <Switcher {...register('player 1 source', p1CycleSource)} label="Source" value={p1Source} />
            <Switcher {...register('player 1 input', p1CycleInput)} label="Input" value={p1Input?.label} />
            <h2>Player 2</h2>
            <Switcher {...register('player 2 source', p2CycleSource)} label="Source" value={p2Source} />
            <Switcher {...register('player 2 input', p2CycleInput)} label="Input" value={p2Input?.label} />
            <hr />
            {p1Source === MicrophoneInputSource.inputName &&
                p2Source === MicrophoneInputSource.inputName &&
                p1Input.deviceId !== p2Input.deviceId && (
                    <h3>Using different microphone devices is not yet supported</h3>
                )}
            <MenuButton {...register('go back', goBack)}>Return To Main Menu</MenuButton>
        </MenuContainer>
    );
}
export default SelectInput;
