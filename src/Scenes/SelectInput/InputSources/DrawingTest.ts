import { getInputId } from 'Players/utils';
import { InputSource } from './interfaces';

const inputs = [
    {
        channels: 2,
        channel: 1,
        label: 'Drawing Test Input',
        id: getInputId({ deviceId: 'default', channel: 1 }),
        deviceId: 'default',
    },
];

export class DrawingTestInputSource {
    public static readonly inputName = 'DrawingTest';

    public static getDefault = () => inputs[0];

    public static getInputs = async (): Promise<InputSource[]> => inputs;

    public static subscribeToListChange = (callback: () => void) => undefined;
    public static unsubscribeToListChange = (callback: () => void) => undefined;
}
