export default interface InputInterface {
  startMonitoring: (deviceId?: string) => Promise<void>;
  getChannelsCount: (deviceId?: string) => number;
  stopMonitoring: (deviceId?: string) => Promise<void>;
  getInputLag: (deviceId?: string) => number;
  getFrequencies: (deviceId?: string) => number[] | number[][];
  getVolumes: (deviceId?: string) => number[];

  requestReadiness: (deviceId?: string) => Promise<boolean>;

  getStatus: (deviceId?: string, channel?: number) => inputStatus;
}

export type inputStatus = 'ok' | 'unavailable' | 'unstable';
