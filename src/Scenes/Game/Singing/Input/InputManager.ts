import DrawingTestInput from 'Scenes/Game/Singing/Input/DrawingTestInput';
import dummyInput from 'Scenes/Game/Singing/Input/DummyInput';
import MicInput from 'Scenes/Game/Singing/Input/MicInput';
import RemoteMicInput from 'Scenes/Game/Singing/Input/RemoteMicInput';
import { DrawingTestInputSource } from 'Scenes/SelectInput/InputSources/DrawingTest';
import { InputSourceNames } from 'Scenes/SelectInput/InputSources/interfaces';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';
import InputInterface from './Interface';

interface PlayerInput {
    input: InputInterface;
    deviceId?: string;
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

    public setPlayerInput = (playerNumber: number, source: InputSourceNames, channel = 0, deviceId?: string) => {
        this.playerInputs[playerNumber] = { input: this.sourceNameToInput(source), deviceId, channel };
    };

    public startMonitoring = async () => {
        Promise.all(this.playerInputs.map((playerInput) => playerInput.input.startMonitoring(playerInput.deviceId)));
    };

    public stopMonitoring = async () => {
        Promise.all(this.playerInputs.map((playerInput) => playerInput.input.stopMonitoring()));
    };

    // todo: Create eg. "InputSourceManager" and have the logic there?
    private sourceNameToInput = (sourceName: InputSourceNames) => {
        if (sourceName === MicrophoneInputSource.inputName) return MicInput;
        if (sourceName === DrawingTestInputSource.inputName) return DrawingTestInput;
        if (sourceName === RemoteMicrophoneInputSource.inputName) return RemoteMicInput;
        return dummyInput;
    };
}

export default new InputManager();
