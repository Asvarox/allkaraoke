import PhonesManager, { Phone } from 'Scenes/ConnectPhone/PhonesManager';
import InputInterface from './Interface';

class RemoteMicInput implements InputInterface {
    private frequencies: [number] = [220];
    private volumes: [number] = [1];

    private phone: Phone | null = null;

    public startMonitoring = async (phoneId?: string) => {
        this.phone = PhonesManager.getPhoneById(phoneId ?? '') ?? null;
        if (!this.phone) return;

        return this.phone.getInput().startMonitoring();
    };

    public getFrequencies = () => {
        const val = this.phone?.getInput().getFrequencies() ?? this.frequencies;
        console.log(val);

        return val;
    };
    public getVolumes = () => this.phone?.getInput().getVolumes() ?? this.volumes;

    public stopMonitoring = async () => this.phone?.getInput().stopMonitoring();

    public getInputLag = () => this.phone?.getInput().getInputLag() ?? 0;
    public getChannelsCount = () => 1;
}

export default new RemoteMicInput();
