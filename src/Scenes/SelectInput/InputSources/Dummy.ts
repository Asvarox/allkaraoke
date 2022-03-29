import { InputSource } from './interfaces';

export class DummyInputSource {
    public static inputName = 'Dummy';

    public static getInputs = async (): Promise<InputSource[]> => [
        {
            channels: 2,
            label: 'Dummy Input',
            id: 'default',
        },
    ];

    public static subscribeToListChange = (callback: () => void) => undefined;
    public static unsubscribeToListChange = (callback: () => void) => undefined;
}
