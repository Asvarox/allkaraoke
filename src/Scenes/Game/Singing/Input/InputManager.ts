import InputInterface from './Interface';

interface PlayerInput {
    input: InputInterface;
    channel: number;
}

class InputManager {
    private playerInputs: PlayerInput[] = [];

    public getPlayerFrequency = (playerNumber: number) => {
        const frequencies = this.playerInputs[playerNumber].input.getFrequencies();

        return frequencies[this.playerInputs[playerNumber].channel];
    };

    public getPlayerVolume = (playerNumber: number) => {
        const frequencies = this.playerInputs[playerNumber].input.getVolumes();

        return frequencies[this.playerInputs[playerNumber].channel];
    };

    public getPlayerInputLag = (playerNumber: number) => this.playerInputs[playerNumber].input.getInputLag();

    public setPlayerInput = (playerNumber: number, input: InputInterface, channel = 0) => {
        this.playerInputs[playerNumber] = { input, channel };
    };

    public startMonitoring = async () => {
        Promise.all(this.playerInputs.map((playerInput) => playerInput.input.startMonitoring()));
    };

    public stopMonitoring = async () => {
        Promise.all(this.playerInputs.map((playerInput) => playerInput.input.stopMonitoring()));
    };
}

export default new InputManager();
