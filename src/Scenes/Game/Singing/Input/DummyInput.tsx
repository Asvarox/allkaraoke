import InputInterface from './Interface';

class DummyInput implements InputInterface {
    private frequencies: [number, number] = [410, 210];
    private timestamp = 0;
    private interval: number | null = null;

    private isMonitoring = false;

    public startMonitoring = async () => {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        this.interval = window.setInterval(() => {
            this.timestamp = this.timestamp + 32;

            const secPart = 9; // this.timestamp % 1000;
            if (secPart > 232 && secPart < 708) {
                this.frequencies[0] = 0;
                this.frequencies[1] = 0;
            } else {
                this.frequencies[0] = Math.sin(this.timestamp / 1000) * 50 + 100;
                this.frequencies[1] = Math.cos(this.timestamp / 1000) * 50 + 200;
            }
        }, 32);
    };

    public getFrequencies = () => this.frequencies;

    public stopMonitoring = async () => {
        if (!this.isMonitoring) return;
        this.isMonitoring = false;
        if (this.interval) {
            window.clearInterval(this.interval);
        }
    };

    public getInputLag = () => 150;
    public getChannelsCount = () => 2;
}

export default new DummyInput();
