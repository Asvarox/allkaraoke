import { InputSource } from './interfaces';

export class DrawingTestInputSource {
    public static readonly inputName = 'DrawingTest';

    public static getDefault = () => 'default;1';

    public static getInputs = async (): Promise<InputSource[]> => [
        {
            channels: 2,
            channel: 1,
            label: 'Drawing Test Input',
            id: 'default;1',
            deviceId: 'default',
        },
    ];

    public static subscribeToListChange = (callback: () => void) => undefined;
    public static unsubscribeToListChange = (callback: () => void) => undefined;
}
