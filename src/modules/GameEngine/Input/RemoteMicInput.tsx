import InputInterface from 'modules/GameEngine/Input/Interface';
import RemoteMicManager from 'modules/RemoteMic/RemoteMicManager';

class RemoteMicInput implements InputInterface {
  private frequencies: [number] = [0];
  private volumes: [number] = [1];

  public startMonitoring = async (remoteMicId?: string) => {
    return RemoteMicManager.getRemoteMicById(remoteMicId ?? '')
      ?.getInput()
      .startMonitoring();
  };

  public getFrequencies = (deviceId?: string) => {
    const val = RemoteMicManager.getRemoteMicById(deviceId ?? '')
      ?.getInput()
      .getFrequencies();

    return val ?? this.frequencies;
  };
  public clearFrequencies = (deviceId?: string) => {
    RemoteMicManager.getRemoteMicById(deviceId ?? '')
      ?.getInput()
      .clearFrequencies();
  };

  public getVolumes = (deviceId?: string) => {
    const val = RemoteMicManager.getRemoteMicById(deviceId ?? '')
      ?.getInput()
      .getVolumes();

    return val ?? this.volumes;
  };

  public stopMonitoring = async (deviceId?: string) =>
    RemoteMicManager.getRemoteMicById(deviceId ?? '')
      ?.getInput()
      .stopMonitoring();

  public requestReadiness = (deviceId?: string) =>
    RemoteMicManager.getRemoteMicById(deviceId ?? '')
      ?.getInput()
      .requestReadiness() ?? Promise.resolve(true);

  public getInputLag = (deviceId?: string) =>
    RemoteMicManager.getRemoteMicById(deviceId ?? '')
      ?.getInput()
      .getInputLag() ?? 0;

  public getStatus = (deviceId?: string) => {
    const mic = RemoteMicManager.getRemoteMicById(deviceId ?? '');

    if (!mic || mic.getLatency() > 1500) {
      return 'unavailable' as const;
    } else if (mic.getLatency() > 500) {
      return 'unstable' as const;
    }

    return 'ok' as const;
  };
}

export default new RemoteMicInput();
