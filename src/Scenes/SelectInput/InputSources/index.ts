import { DummyInputSource } from './Dummy';
import { MicrophoneInputSource } from './Microphone';

const sources = {
    [MicrophoneInputSource.inputName]: MicrophoneInputSource,
    [DummyInputSource.inputName]: DummyInputSource,
};

export default sources;
