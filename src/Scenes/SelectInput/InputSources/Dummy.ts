import { InputSource } from './interfaces';

export class DummyInputSource {
    public static readonly inputName = 'Dummy';

    public static getDefault = () => 'default;0';

    public static getInputs = async (): Promise<InputSource[]> => [
        {
            channels: 2,
            channel: 0,
            label: 'Dummy Input 1',
            id: 'default;0',
            deviceId: 'default',
        },
        {
            channels: 2,
            channel: 1,
            label: 'Dummy Input 2',
            id: 'default;1',
            deviceId: 'default',
        },
    ];

    public static subscribeToListChange = (callback: () => void) => undefined;
    public static unsubscribeToListChange = (callback: () => void) => undefined;
}
