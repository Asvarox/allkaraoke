import { MicInput } from 'Scenes/Game/Singing/Input/MicInput';
import InputInterface from './Interface';

class MultiMicInput implements InputInterface {
  private devices: Record<string, MicInput> = {};
  public startMonitoring = async (deviceId?: string, echoCancellation = false) => {
    if (deviceId) {
      if (!this.devices[deviceId]) {
        this.devices[deviceId] = new MicInput();
      }
      await this.devices[deviceId].startMonitoring(deviceId, echoCancellation);
    }
  };

  public getFrequencies = (deviceId?: string) => {
    if (deviceId && this.devices[deviceId]) {
      return this.devices[deviceId].getFrequencies();
    }
    return [0, 0];
  };

  public getVolumes = (deviceId?: string) => {
    if (deviceId && this.devices[deviceId]) {
      return this.devices[deviceId].getVolumes();
    }
    return [0, 0];
  };
  public clearFrequencies = (deviceId?: string) => {
    if (deviceId && this.devices[deviceId]) {
      return this.devices[deviceId].clearFrequencies(deviceId);
    }
  };
  public stopMonitoring = async () => {
    Object.values(this.devices).forEach((device) => device.stopMonitoring());
  };

  public getInputLag = (deviceId?: string) => {
    if (deviceId && this.devices[deviceId]) {
      return this.devices[deviceId].getInputLag();
    }

    return 180;
  };
  public requestReadiness = async (deviceId?: string) => {
    if (deviceId && this.devices[deviceId]) {
      return this.devices[deviceId].requestReadiness();
    }

    return true;
  };

  public getStatus = (deviceId?: string) => {
    if (deviceId && this.devices[deviceId]) {
      return this.devices[deviceId].getStatus();
    }
    return 'ok' as const;
  };
}

export default new MultiMicInput();
