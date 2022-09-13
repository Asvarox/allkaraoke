import { useEffect, useState } from 'react';
import sources from 'Scenes/SelectInput/InputSources';
import { InputSource } from 'Scenes/SelectInput/InputSources/interfaces';

export interface SourceInputDefault {
    list: InputSource[];
    getDefault: () => string | null;
}

export type SourceMap = Record<string, SourceInputDefault>;
const initialState: SourceMap = sources.reduce<SourceMap>(
    (acc, elem) => ({
        ...acc,
        [elem.inputName]: {
            list: [],
            getDefault: elem.getDefault,
        },
    }),
    {},
);

export function useMicrophoneList() {
    const [inputs, setInputs] = useState(initialState);
    const [isLoaded, setIsLoaded] = useState(false);

    const enumerateDevices = () => {
        Promise.all(sources.map((source) => source.getInputs()))
            .then((inputs) =>
                inputs.reduce(
                    (acc, elem, index) => ({
                        ...acc,
                        [sources[index].inputName]: {
                            list: elem,
                            getDefault: sources[index].getDefault,
                        },
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
