export interface FrequencyDetectionStrategy {
    getSampleSize(): number;

    init(context: AudioContext, processor: ScriptProcessorNode): Promise<void>;

    getFrequency(data: Float32Array): Promise<number>;
}
