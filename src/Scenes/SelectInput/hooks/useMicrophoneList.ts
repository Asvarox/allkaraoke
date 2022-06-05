import { useEffect, useState } from 'react';
import sources from 'Scenes/SelectInput/InputSources';
import { InputSource } from 'Scenes/SelectInput/InputSources/interfaces';

export type SourceMap = Record<string, InputSource[]>;
const initialState: SourceMap = sources.reduce<SourceMap>(
    (acc, elem) => ({
        ...acc,
        [elem.inputName]: [],
    }),
    {},
);

export function useMicrophoneList(onEnumerate?: (inputs: MediaDeviceInfo[]) => void) {
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
