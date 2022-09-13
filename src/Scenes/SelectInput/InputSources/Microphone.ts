import { range } from 'lodash-es';
import { InputSource } from './interfaces';

interface NameMapper {
    test: (label: string, channel: number) => boolean;
    map: (label: string, channel: number) => string;
}

const singstarWirelessMicMapper: NameMapper = {
    test: (label) => label.toLowerCase().startsWith('wireless mic #'),
    map: (label, channel) => `Singstar Wireless - ${channel === 0 ? 'Blue' : 'Red'}`,
};
const singstarWiredMicMapper: NameMapper = {
    test: (label) => label.toLowerCase().startsWith('usbmic serial#'),
    map: (label, channel) => `Singstar Wired - ${channel === 0 ? 'Blue' : 'Red'}`,
};

const mapInputName = (label: string, channel: number) => {
    if (singstarWirelessMicMapper.test(label, channel)) return singstarWirelessMicMapper.map(label, channel);
    if (singstarWiredMicMapper.test(label, channel)) return singstarWirelessMicMapper.map(label, channel);

    return label;
};

export class MicrophoneInputSource {
    public static readonly inputName = 'Microphone';

    public static getDefault = () => 'default;0';

    public static getInputs = async (): Promise<InputSource[]> => {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();

        return (devices as any as Array<MediaStreamTrack & MediaDeviceInfo>)
            .filter((device) => device.kind === 'audioinput')
            .map((device) => {
                const channels = device.getCapabilities()?.channelCount?.max ?? 1;

                return range(0, channels).map((channel) => ({
                    label: mapInputName(device.label, channel),
                    channel,
                    channels,
                    deviceId: device.deviceId,
                    id: `${device.deviceId};${channel}`,
                }));
            })
            .flat();
    };

    public static subscribeToListChange = (callback: () => void) =>
        navigator.mediaDevices.addEventListener('devicechange', callback);
    public static unsubscribeToListChange = (callback: () => void) =>
        navigator.mediaDevices.removeEventListener('devicechange', callback);
}
