import { DrawingTestInputSource } from 'Scenes/SelectInput/InputSources/DrawingTest';
import { DummyInputSource } from 'Scenes/SelectInput/InputSources/Dummy';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';

export interface InputSource {
    label: string;
    channels: number;
    channel: number;
    id: string;
    deviceId: string;
    preferred?: number;
}

export type InputSourceNames =
    | typeof MicrophoneInputSource.inputName
    | typeof DummyInputSource.inputName
    | typeof RemoteMicrophoneInputSource.inputName
    | typeof DrawingTestInputSource.inputName;

export interface InputSourceManagerInterface {
    inputName: InputSourceNames;

    getDefault: () => InputSource | null;
    getInputs: () => Promise<InputSource[]>;
    subscribeToListChange: (callback: () => void) => void;
    unsubscribeToListChange: (callback: () => void) => void;
}

export interface InputSourceList {
    list: InputSource[];
    getDefault: () => InputSource | null;
}
