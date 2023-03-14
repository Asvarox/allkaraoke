import events from 'GameEvents/GameEvents';
import AubioStrategy from 'Scenes/Game/Singing/Input/MicStrategies/Aubio';
import userMediaService from 'UserMedia/userMediaService';
import Listener from 'utils/Listener';
import InputInterface from './Interface';

class MicInput extends Listener<[[number, number], [number, number]]> implements InputInterface {
    private stream: MediaStream | null = null;
    private context: AudioContext | null = null;

    private interval: ReturnType<typeof setInterval> | null = null;

    private frequencies: [number, number] = [0, 0];
    private volumes: [number, number] = [0, 0];

    private startedMonitoring = false;

    public startMonitoring = async (deviceId?: string, echoCancellation = false) => {
        if (this.startedMonitoring) return;
        this.startedMonitoring = true;

        this.stream = await userMediaService.getUserMedia({
            audio: {
                ...(deviceId ? { deviceId, exact: true } : {}),
                echoCancellation: echoCancellation,
            },
            video: false,
        });

        this.context = new AudioContext();

        const source = this.context.createMediaStreamSource(this.stream);
        const splitter = this.context.createChannelSplitter(2);
        source.connect(splitter);

        const analyserCh0 = this.context.createAnalyser();
        analyserCh0.fftSize = 2048;
        analyserCh0.minDecibels = -100;
        const analyserCh1 = this.context.createAnalyser();
        analyserCh1.fftSize = 2048;
        analyserCh1.minDecibels = -100;
        splitter.connect(analyserCh0, 0);
        splitter.connect(analyserCh1, 1);

        const strategy = new AubioStrategy();
        await strategy.init(this.context, analyserCh0.fftSize);

        this.interval = setInterval(async () => {
            const dataCh0 = new Float32Array(analyserCh0.fftSize);
            const dataCh1 = new Float32Array(analyserCh1.fftSize);

            analyserCh0.getFloatTimeDomainData(dataCh0);
            analyserCh1.getFloatTimeDomainData(dataCh1);

            this.frequencies = await Promise.all([strategy.getFrequency(dataCh0), strategy.getFrequency(dataCh1)]);

            this.volumes = [this.calculateVolume(dataCh0), this.calculateVolume(dataCh1)];

            this.onUpdate(this.frequencies, this.volumes);
        }, this.context.sampleRate / analyserCh0.fftSize);

        events.micMonitoringStarted.dispatch();
    };

    public getFrequencies = () => {
        return this.frequencies;
    };
    public getVolumes = () => this.volumes;

    public stopMonitoring = async () => {
        if (!this.startedMonitoring) return;
        this.startedMonitoring = false;
        this.interval && clearInterval(this.interval);
        this.stream?.getTracks().forEach(function (track) {
            track.stop();
        });
        try {
            await this.context?.close();
        } catch (e) {
            console.log('MicInput.stoMonitoring error', e);
        }

        events.micMonitoringStopped.dispatch();
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
    public requestReadiness = () => Promise.resolve(true);
}

export default new MicInput();
