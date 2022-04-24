import InputInterface from './Interface';
import AubioStrategy from './MicStrategies/Aubio';

class MicInput implements InputInterface {
    private stream: MediaStream | null = null;
    private context: AudioContext | null = null;

    private frequencies: [number, number] = [0, 0];
    private volumes: [number, number] = [0, 0];

    private startedMonitoring = false;

    public startMonitoring = async (deviceId?: string) => {
        console.log('start');
        if (this.startedMonitoring) return;
        this.startedMonitoring = true;

        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                ...(deviceId ? { deviceId, exact: true } : {}),
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

            this.volumes = [this.calculateVolume(inputData1), this.calculateVolume(inputData2)];
        };
    };

    public getFrequencies = () => {
        return this.frequencies;
    };
    public getVolumes = () => this.volumes;

    public stopMonitoring = async () => {
        console.log('stop');
        if (!this.startedMonitoring) return;
        this.startedMonitoring = false;
        this.stream?.getTracks().forEach(function (track) {
            track.stop();
        });
        await this.context?.close();
    };

    public getInputLag = () => 180;
    public getChannelsCount = () => 2;

    private calculateVolume(input: Float32Array) {
        let i;
        let sum = 0.0;
        for (i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
        }
        return Math.sqrt(sum / input.length);
    }
}

export default new MicInput();
