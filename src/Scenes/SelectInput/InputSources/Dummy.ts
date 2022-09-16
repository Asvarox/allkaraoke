import { InputSource } from './interfaces';

const inputList = [
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

export class DummyInputSource {
    public static readonly inputName = 'Dummy';

    public static getDefault = () => inputList[0];

    public static getInputs = async (): Promise<InputSource[]> => inputList;

    public static subscribeToListChange = (callback: () => void) => undefined;
    public static unsubscribeToListChange = (callback: () => void) => undefined;
}
