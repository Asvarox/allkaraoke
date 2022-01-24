import InputInterface from './Interface';
import AubioStrategy from './MicStrategies/Aubio';

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

            this.frequencies = await Promise.all([
                strategy.getFrequency(inputData1),
                strategy.getFrequency(inputData2),
            ]);
        };
    };

    public getFrequencies = () => this.frequencies;

    public stopMonitoring = async () => {
        this.stream?.getTracks().forEach(function (track) {
            track.stop();
        });
        await this.context?.close();
    };

    public getInputLag = () => 180;
    public getChannelsCount = () => 2;
}

export default new MicInput();
