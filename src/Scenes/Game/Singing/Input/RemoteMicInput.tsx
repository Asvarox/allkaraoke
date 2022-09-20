import PhonesManager, { Phone } from 'Scenes/ConnectPhone/PhonesManager';
import InputInterface from './Interface';

class RemoteMicInput implements InputInterface {
    private frequencies: [number] = [0];
    private volumes: [number] = [1];

    private phone: Phone | null = null;

    public startMonitoring = async (phoneId?: string) => {
        this.phone = PhonesManager.getPhoneById(phoneId ?? '') ?? null;
        if (!this.phone) return;

        return this.phone.getInput().startMonitoring();
    };

    public getFrequencies = (deviceId?: string) => {
        const val = PhonesManager.getPhoneById(deviceId ?? '')
            ?.getInput()
            .getFrequencies();
        // console.log(deviceId, val);

        return val ?? this.frequencies;
    };
    public getVolumes = (deviceId?: string) => {
        const val = PhonesManager.getPhoneById(deviceId ?? '')
            ?.getInput()
            .getVolumes();
        // console.log(deviceId, val);

        return val ?? this.volumes;
    };

    public stopMonitoring = async () => this.phone?.getInput().stopMonitoring();

    public getInputLag = (deviceId?: string) =>
        PhonesManager.getPhoneById(deviceId ?? '')
            ?.getInput()
            .getInputLag() ?? 0;

    public getChannelsCount = () => 1;
}

export default new RemoteMicInput();
