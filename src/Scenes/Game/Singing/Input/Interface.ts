export default interface InputInterface {
    startMonitoring: (deviceId?: string) => Promise<void>;
    getChannelsCount: (deviceId?: string) => number;
    stopMonitoring: (deviceId?: string) => Promise<void>;
    getInputLag: (deviceId?: string) => number;
    getFrequencies: (deviceId?: string) => number[];
    getVolumes: (deviceId?: string) => number[];
}
