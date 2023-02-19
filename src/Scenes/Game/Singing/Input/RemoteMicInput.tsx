import PhoneManager from 'RemoteMic/PhoneManager';
import InputInterface from './Interface';

class RemoteMicInput implements InputInterface {
    private frequencies: [number] = [0];
    private volumes: [number] = [1];

    public startMonitoring = async (phoneId?: string) => {
        return PhoneManager.getPhoneById(phoneId ?? '')
            ?.getInput()
            .startMonitoring();
    };

    public getFrequencies = (deviceId?: string) => {
        const val = PhoneManager.getPhoneById(deviceId ?? '')
            ?.getInput()
            .getFrequencies();

        return val ?? this.frequencies;
    };
    public getVolumes = (deviceId?: string) => {
        const val = PhoneManager.getPhoneById(deviceId ?? '')
            ?.getInput()
            .getVolumes();

        return val ?? this.volumes;
    };

    public stopMonitoring = async (deviceId?: string) =>
        PhoneManager.getPhoneById(deviceId ?? '')
            ?.getInput()
            .stopMonitoring();

    public requestReadiness = (deviceId?: string) =>
        PhoneManager.getPhoneById(deviceId ?? '')
            ?.getInput()
            .requestReadiness() ?? Promise.resolve(true);

    public getInputLag = (deviceId?: string) =>
        PhoneManager.getPhoneById(deviceId ?? '')
            ?.getInput()
            .getInputLag() ?? 0;

    public getChannelsCount = () => 1;
}

export default new RemoteMicInput();
