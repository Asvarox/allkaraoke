import { InputSource } from './interfaces';

export class RemoteMicrophoneInputSource {
    public static readonly inputName = 'RemoteMicrophone';

    public static getInputs = async (): Promise<InputSource[]> => [
        {
            channels: 1,
            channel: 0,
            label: 'Drawing Test Input',
            id: 'default;0',
            deviceId: 'default',
        },
    ];

    public static subscribeToListChange = (callback: () => void) => undefined;
    public static unsubscribeToListChange = (callback: () => void) => undefined;
}
