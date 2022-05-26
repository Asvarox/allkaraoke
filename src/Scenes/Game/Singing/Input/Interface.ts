export default interface InputInterface {
    startMonitoring: (deviceId?: string) => Promise<void>;
    getChannelsCount: () => number;
    stopMonitoring: () => Promise<void>;
    getInputLag: () => number;
    getFrequencies: () => number[];
    getVolumes: () => number[];
}
