interface InputSource {
    label: string;
    channels: number;
    id: string;
}

export class MicrophoneInputSource {
    public static inputName = 'Microphone';

    public static getInputs = async (): Promise<InputSource[]> => {
        return navigator.mediaDevices.enumerateDevices().then((devices) =>
            (devices as any as Array<MediaStreamTrack & MediaDeviceInfo>)
                .filter((device) => device.kind === 'audioinput')
                .map((device) => ({
                    label: device.label,
                    channels: device.getCapabilities()?.channelCount?.max ?? 1,
                    id: device.deviceId,
                })),
        );
    };

    public static subscribeToListChange = (callback: () => void) =>
        navigator.mediaDevices.addEventListener('devicechange', callback);
    public static unsubscribeToListChange = (callback: () => void) =>
        navigator.mediaDevices.removeEventListener('devicechange', callback);
}
