import { SelectedPlayerInput } from '~/modules/Players/PlayersManager';

export default interface InputInterface {
  startMonitoring: (deviceId?: string, allInputs?: SelectedPlayerInput[]) => Promise<void>;
  stopMonitoring: (deviceId?: string) => Promise<void>;
  getInputLag: (deviceId?: string) => number;
  getFrequencies: (deviceId?: string) => number[] | number[][];
  clearFrequencies: (deviceId?: string) => void;
  getVolumes: (deviceId?: string) => number[];

  requestReadiness: (deviceId?: string) => Promise<boolean>;

  getStatus: (deviceId?: string, channel?: number) => inputStatus;
}

export type inputStatus = 'ok' | 'unavailable' | 'unstable';
