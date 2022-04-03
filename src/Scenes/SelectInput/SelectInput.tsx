import { useEffect, useState } from 'react';
import { MenuButton, MenuContainer } from '../../Elements/Menu';
import { navigate } from '../../Hooks/useHashLocation';
import useKeyboard from '../../Hooks/useKeyboard';
import tuple from '../../Utils/tuple';
import { Switcher } from '../Game/SongSelection/Switcher';
import inputSources from './InputSources';
import { DummyInputSource } from './InputSources/Dummy';
import { InputSource } from './InputSources/interfaces';
import { MicrophoneInputSource } from './InputSources/Microphone';

interface Props {
    // file?: string;
}

const sources = [MicrophoneInputSource, DummyInputSource];

type SourceMap = Record<keyof typeof inputSources, InputSource[]>;

const initialState: SourceMap = sources.reduce(
    (acc, elem) => ({
        ...acc,
        [elem.inputName]: [],
    }),
    {},
);

function useMicrophoneList(onEnumerate?: (inputs: MediaDeviceInfo[]) => void) {
    const [inputs, setInputs] = useState(initialState);

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
            .then(setInputs);
    };

    useEffect(() => {
        enumerateDevices();
    }, []);

    useEffect(() => {
        sources.forEach((source) => source.subscribeToListChange(enumerateDevices));

        return () => sources.forEach((source) => source.unsubscribeToListChange(enumerateDevices));
    });

    return inputs;
}

function usePlayerInput(sourceMap: SourceMap) {
    const [selectedSource, setSelectedSource] = useState<string>(Object.keys(sourceMap)[0]);
    const [selectedInput, setSelectedInput] = useState<string>('default');

    const list = sourceMap[selectedSource];

    useEffect(() => {
        if (!list) {
            setSelectedSource(Object.keys(sourceMap)[0]);
            setSelectedInput('default');
        }
    }, [sourceMap]);

    useEffect(() => {
        if (selectedInput === '' || !list?.find((device) => device.id === selectedInput)) {
            setSelectedInput('default');
        }
    }, [sourceMap, list]);

    const selectedInputIndex = list?.findIndex((device) => device.id === selectedInput);
    const cycleInputs = () => setSelectedInput(list?.[(selectedInputIndex + 1) % list.length]?.id ?? 'default');

    const cycleSources = () => {
        const sourceList = Object.keys(sourceMap);
        const selectedSourceIndex = sourceList.indexOf(selectedSource);
        setSelectedSource(sourceList?.[(selectedSourceIndex + 1) % sourceList.length] ?? 'default');
    };

    return tuple([selectedSource, cycleSources, list[selectedInputIndex], cycleInputs]);
}

function SelectInput(props: Props) {
    const inputs = useMicrophoneList();

    const [p1Source, p1CycleSource, p1Input, p1CycleInput] = usePlayerInput(inputs);
    const [p2Source, p2CycleSource, p2Input, p2CycleInput] = usePlayerInput(inputs);

    const goBack = () => navigate('/');

    const { register } = useKeyboard(true, goBack);

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
            <MenuButton {...register('go back', goBack)}>Return To Main Menu</MenuButton>
        </MenuContainer>
    );
}
export default SelectInput;
