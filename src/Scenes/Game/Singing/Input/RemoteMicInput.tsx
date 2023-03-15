import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import InputInterface from './Interface';

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

    public getChannelsCount = () => 1;
}

export default new RemoteMicInput();
