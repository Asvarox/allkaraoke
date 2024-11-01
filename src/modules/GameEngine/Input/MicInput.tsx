import { captureException } from '@sentry/react';
import InputInterface from 'modules/GameEngine/Input/Interface';
import AubioStrategy from 'modules/GameEngine/Input/MicStrategies/Aubio';
import events from 'modules/GameEvents/GameEvents';
import userMediaService from 'modules/UserMedia/userMediaService';

export class MicInput implements InputInterface {
  private stream: MediaStream | null = null;
  private context: AudioContext | null = null;

  private interval: ReturnType<typeof setInterval> | null = null;

  private frequencies: number[] = [0, 0];
  private volumes: number[] = [0, 0];

  private startedMonitoring = false;

  constructor(private channels = 2) {}

  public startMonitoring = async (deviceId?: string) => {
    if (this.startedMonitoring) return;
    this.startedMonitoring = true;

    try {
      this.stream = await userMediaService.getUserMedia({
        audio: {
          ...(deviceId ? { deviceId, exact: true } : {}),
          echoCancellation: false,
        },
        video: false,
      });
      try {
        this.context = new AudioContext();

        const source = this.context.createMediaStreamSource(this.stream);

        const analysers = Array.from({ length: this.channels }, () => {
          const analyser = this.context!.createAnalyser();
          analyser.fftSize = 2048;
          analyser.minDecibels = -100;
          return analyser;
        });

        if (this.channels > 1) {
          const splitter = this.context.createChannelSplitter(2);
          source.connect(splitter);

          analysers.forEach((analyser, i) => {
            splitter.connect(analyser, i);
          });
        } else {
          source.connect(analysers[0]);
        }

        console.log(this.channels);

        const strategy = new AubioStrategy();
        await strategy.init(this.context, analysers[0].fftSize);

        this.interval = setInterval(async () => {
          const frequencyData = analysers.map((analyser) => new Float32Array(analyser.fftSize));

          analysers.forEach((analyser, i) => {
            analyser.getFloatTimeDomainData(frequencyData[i]);
          });

          this.frequencies = await Promise.all(frequencyData.map((data) => strategy.getFrequency(data)));
          this.volumes = frequencyData.map((data) => this.calculateVolume(data));
        }, this.context.sampleRate / analysers[0].fftSize);

        events.micMonitoringStarted.dispatch();
      } catch (e) {
        captureException(e);
        console.error(e);
      }
    } catch (e) {
      captureException(e, { level: 'warning' });
      console.warn(e);
    }
  };

  public getFrequencies = () => {
    return this.frequencies;
  };
  public getVolumes = () => this.volumes;
  public clearFrequencies = (deviceId?: string) => undefined;

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

  private calculateVolume(input: Float32Array) {
    let i;
    let sum = 0.0;
    for (i = 0; i < input.length; ++i) {
      sum += input[i] * input[i];
    }
    return Math.sqrt(sum / input.length);
  }
  public requestReadiness = () => Promise.resolve(true);

  public getStatus = () => 'ok' as const;
}

export default new MicInput();
