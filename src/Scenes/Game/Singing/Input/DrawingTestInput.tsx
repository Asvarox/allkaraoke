import InputInterface from './Interface';

class DrawingTestInput implements InputInterface {
    private frequencies: [number, number] = [440, 410];

    private i: number = 0;

    public startMonitoring = async () => {
        this.i = 0;
    };

    public getFrequencies = () => {
        return this.frequencies;
    };

    public stopMonitoring = async () => {};

    public getInputLag = () => 0;
    public getChannelsCount = () => 2;

    public setFrequency = (channel: 0 | 1, value: number) => (this.frequencies[channel] = value);
}

export default new DrawingTestInput();
