import InputInterface from './Interface';

const CHANNEL2_VALUES = [410, 413, 416, 413, 410, 407, 404, 407];

class DrawingTestInput implements InputInterface {
    private frequencies: [number, number] = [440, CHANNEL2_VALUES[0]];

    private i: number = 0;

    public startMonitoring = async () => {
        this.i = 0;
    };

    public getFrequencies = () => {
        this.i = (this.i + 1) % CHANNEL2_VALUES.length;
        this.frequencies[1] = CHANNEL2_VALUES[this.i];
        return this.frequencies;
    };

    public stopMonitoring = async () => {};

    public getInputLag = () => 0;
    public getChannelsCount = () => 2;
}

export default new DrawingTestInput();
