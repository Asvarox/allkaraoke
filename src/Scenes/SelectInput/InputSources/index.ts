import { DummyInputSource } from './Dummy';
import { MicrophoneInputSource } from './Microphone';
import { RemoteMicrophoneInputSource } from './Remote';

const sources = [MicrophoneInputSource, DummyInputSource, RemoteMicrophoneInputSource];

export default sources;
