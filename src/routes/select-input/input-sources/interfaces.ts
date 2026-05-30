import { DummyInputSource } from '~/routes/select-input/input-sources/dummy';
import { MicrophoneInputSource } from '~/routes/select-input/input-sources/microphone';
import { RemoteMicrophoneInputSource } from '~/routes/select-input/input-sources/remote';

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
  | typeof RemoteMicrophoneInputSource.inputName;

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
  initialised: boolean;
}
