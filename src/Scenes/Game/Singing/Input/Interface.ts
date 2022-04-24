export default interface InputInterface {
    startMonitoring: () => Promise<void>;
    getChannelsCount: () => number;
    stopMonitoring: () => Promise<void>;
    getInputLag: () => number;
    getFrequencies: () => number[];
    getVolumes: () => number[];
}
