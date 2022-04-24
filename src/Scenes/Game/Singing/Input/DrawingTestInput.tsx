import InputInterface from './Interface';

class DrawingTestInput implements InputInterface {
    private frequencies: [number, number] = [440, 410];
    private volumes: [number, number] = [1, 1];

    public startMonitoring = async () => {};

    public getFrequencies = () => this.frequencies;
    public getVolumes = () => this.volumes;

    public stopMonitoring = async () => {};

    public getInputLag = () => 0;
    public getChannelsCount = () => 2;

    public setFrequency = (channel: 0 | 1, value: number) => (this.frequencies[channel] = value);
}

export default new DrawingTestInput();
