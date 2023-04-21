import { range } from 'lodash-es';
import { InputSource } from './interfaces';
import userMediaService from 'UserMedia/userMediaService';
import * as Sentry from '@sentry/react';

interface NameMapper {
    test: (label: string, channel: number, channels: number) => boolean;
    map: (label: string, channel: number) => string;
}

const singstarWirelessMicMapper: NameMapper = {
    test: (label) =>
        label.toLowerCase().includes('wireless mic #') || label.toLowerCase().includes('sony wireless singstar'),
    map: (label, channel) => `SingStar Wireless - ${channel === 0 ? 'Blue' : 'Red'}`,
};
const singstarWiredMicMapper: NameMapper = {
    test: (label) => label.toLowerCase().includes('usbmic serial#') || label.toLowerCase().includes('singstar'),
    map: (label, channel) => `SingStar Wired - ${channel === 0 ? 'Blue' : 'Red'}`,
};
const singstarGenericMapper: NameMapper = {
    test: (label, channel, channels) => channels === 2 && label.toLowerCase().includes('singstar'),
    map: (label, channel) => `SingStar Mic - ${channel === 0 ? 'Blue' : 'Red'}`,
};

const getPreferred = (...[label, ch, channels]: Parameters<NameMapper['test']>) =>
    singstarWiredMicMapper.test(label, ch, channels) ||
    singstarWirelessMicMapper.test(label, ch, channels) ||
    singstarGenericMapper.test(label, ch, channels)
        ? ch
        : undefined;

const mapInputName = (label: string, channel: number, channels: number) => {
    if (singstarWirelessMicMapper.test(label, channel, channels)) return singstarWirelessMicMapper.map(label, channel);
    if (singstarWiredMicMapper.test(label, channel, channels)) return singstarWiredMicMapper.map(label, channel);
    if (singstarGenericMapper.test(label, channel, channels)) return singstarGenericMapper.map(label, channel);

    return channels > 1 ? `${label} (ch ${channel + 1})` : label;
};

export class MicrophoneInputSource {
    private static inputList: InputSource[] = [];
    public static readonly inputName = 'Microphone';

    public static getDefault = () =>
        MicrophoneInputSource.inputList.find((input) => input.id === 'default;0') ??
        MicrophoneInputSource.inputList[0] ??
        null;

    public static getInputs = async (): Promise<InputSource[]> => {
        await userMediaService.getUserMedia({ audio: true });

        let devices: MediaDeviceInfo[] = [];

        try {
            devices = await userMediaService.enumerateDevices();
        } catch (e) {
            Sentry.captureException(e, { level: 'warning' });
            console.warn(e);
        }

        MicrophoneInputSource.inputList = (devices as any as Array<MediaStreamTrack & MediaDeviceInfo>)
            .filter((device) => device.kind === 'audioinput')
            .map((device) => {
                const channels = device.getCapabilities?.()?.channelCount?.max ?? 1;

                return range(0, channels).map((channel) => ({
                    label: mapInputName(device.label, channel, channels),
                    channel,
                    channels,
                    deviceId: device.deviceId,
                    id: `${device.deviceId};${channel}`,
                    preferred: getPreferred(device.label, channel, channels),
                }));
            })
            .flat();

        return MicrophoneInputSource.inputList;
    };

    public static subscribeToListChange = (callback: () => void) =>
        navigator.mediaDevices.addEventListener('devicechange', callback);
    public static unsubscribeToListChange = (callback: () => void) =>
        navigator.mediaDevices.removeEventListener('devicechange', callback);
}
