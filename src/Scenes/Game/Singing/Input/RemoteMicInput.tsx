import PhonesManager from 'Scenes/ConnectPhone/PhonesManager';
import InputInterface from './Interface';

class RemoteMicInput implements InputInterface {
    private frequencies: [number] = [0];
    private volumes: [number] = [1];

    public startMonitoring = async (phoneId?: string) => {
        return PhonesManager.getPhoneById(phoneId ?? '')
            ?.getInput()
            .startMonitoring();
    };

    public getFrequencies = (deviceId?: string) => {
        const val = PhonesManager.getPhoneById(deviceId ?? '')
            ?.getInput()
            .getFrequencies();

        return val ?? this.frequencies;
    };
    public getVolumes = (deviceId?: string) => {
        const val = PhonesManager.getPhoneById(deviceId ?? '')
            ?.getInput()
            .getVolumes();

        return val ?? this.volumes;
    };

    public stopMonitoring = async (deviceId?: string) =>
        PhonesManager.getPhoneById(deviceId ?? '')
            ?.getInput()
            .stopMonitoring();

    public getInputLag = (deviceId?: string) =>
        PhonesManager.getPhoneById(deviceId ?? '')
            ?.getInput()
            .getInputLag() ?? 0;

    public getChannelsCount = () => 1;
}

export default new RemoteMicInput();
