export default interface InputInterface {
    startMonitoring: () => Promise<void>;
    getFrequencies: () => number[];
    getChannelsCount: () => number;
    getInputLag: () => number;
    stopMonitoring: () => Promise<void>;
}
