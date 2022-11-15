export interface FrequencyDetectionStrategy {
    getSampleSize(): number;

    init(context: AudioContext, bufferSize: number): Promise<void>;

    getFrequency(data: Float32Array): Promise<number>;
}
