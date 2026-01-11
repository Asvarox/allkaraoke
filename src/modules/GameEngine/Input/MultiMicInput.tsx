import InputInterface from '~/modules/GameEngine/Input/Interface';
import { MicInput } from '~/modules/GameEngine/Input/MicInput';
import { SelectedPlayerInput } from '~/modules/Players/PlayersManager';

const isDeviceSelectedForMultipleChannels = (allInputs: SelectedPlayerInput[] = [], deviceId: string | undefined) => {
  const playerInputs = allInputs.filter((input) => input.deviceId === deviceId).map((input) => input.channel);
  return playerInputs.some((channel) => playerInputs[0] !== channel);
};

class MultiMicInput implements InputInterface {
  private devices: Record<string, InputInterface> = {};
  public startMonitoring = async (deviceId?: string, allInputs?: SelectedPlayerInput[]) => {
    console.log(this.devices);
    if (deviceId) {
      if (!this.devices[deviceId]) {
        this.devices[deviceId] = isDeviceSelectedForMultipleChannels(allInputs, deviceId)
          ? new MicInput(2)
          : new MicInput(1);
      }
      await this.devices[deviceId].startMonitoring(deviceId);
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
    await Promise.all(Object.values(this.devices).map((device) => device.stopMonitoring()));
    this.devices = {};
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
