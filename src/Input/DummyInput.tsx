
class DummyInput {
    private frequencies = [410, 210];

    public startMonitoring = async () => {
    }

    public getFrequencies = () => this.frequencies;

    public stopMonitoring = async () => {
    }
}

export default new DummyInput();