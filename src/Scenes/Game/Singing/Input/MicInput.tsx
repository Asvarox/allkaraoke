import aubio from 'aubiojs';
import InputInterface from './Interface';

interface FrequencyDetectionStrategy {
    getSampleSize(): number;

    init(context: AudioContext, processor: ScriptProcessorNode): Promise<void>;

    getFrequency(data: Float32Array): Promise<number>;
}

class AubioStrategy implements FrequencyDetectionStrategy {
    private detector: any;

    public init = async (context: AudioContext, processor: ScriptProcessorNode): Promise<void> => {
        const { Pitch } = await aubio();

        this.detector = new Pitch('default', processor.bufferSize, processor.bufferSize / 8, context.sampleRate);
        this.detector.setTolerance(0.2);
    };

    public getSampleSize(): number {
        return 1 << 12;
    }

    public getFrequency = async (data: Float32Array) => {
        return this.detector.do(data);
    };
}

class MicInput implements InputInterface {
    // private channelCount = 2;
    private stream: MediaStream | null = null;
    private context: AudioContext | null = null;

    private frequencies: [number, number] = [0, 0];

    public startMonitoring = async () => {
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
            },
            video: false,
        });

        this.context = new AudioContext();
        const strategy = new AubioStrategy();

        const source = this.context.createMediaStreamSource(this.stream);
        const processor = this.context.createScriptProcessor(strategy.getSampleSize());

        source.connect(processor);
        processor.connect(this.context.destination);

        await strategy.init(this.context, processor);

        processor.onaudioprocess = async (e) => {
            const inputData1 = e.inputBuffer.getChannelData(0);
            const inputData2 = e.inputBuffer.getChannelData(1);

            this.frequencies[0] = await strategy.getFrequency(inputData1);
            this.frequencies[1] = await strategy.getFrequency(inputData2);
        };
    };

    public getFrequencies = () => this.frequencies;

    public stopMonitoring = async () => {
        this.stream?.getTracks().forEach(function (track) {
            track.stop();
        });
        await this.context?.close();
    };

    public getInputLag = () => 150;
}

export default new MicInput();
