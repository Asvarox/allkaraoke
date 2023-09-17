import aubio from 'aubiojs';
import { FrequencyDetectionStrategy } from './interfaces';

export default class AubioStrategy implements FrequencyDetectionStrategy {
  private detector: any;

  public init = async (context: AudioContext, buffer: number): Promise<void> => {
    const { Pitch } = await aubio();

    this.detector = new Pitch('default', buffer, buffer / 8, context.sampleRate);
    this.detector.setTolerance(0.5);
  };

  public getSampleSize(): number {
    return 1 << 11;
  }

  public getFrequency = async (data: Float32Array) => {
    return this.detector.do(data);
  };
}
