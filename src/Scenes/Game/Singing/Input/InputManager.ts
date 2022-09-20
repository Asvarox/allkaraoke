import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import DrawingTestInput from 'Scenes/Game/Singing/Input/DrawingTestInput';
import dummyInput from 'Scenes/Game/Singing/Input/DummyInput';
import MicInput from 'Scenes/Game/Singing/Input/MicInput';
import RemoteMicInput from 'Scenes/Game/Singing/Input/RemoteMicInput';
import { DrawingTestInputSource } from 'Scenes/SelectInput/InputSources/DrawingTest';
import { InputSourceNames } from 'Scenes/SelectInput/InputSources/interfaces';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';
import storage from 'utils/storage';

export interface SelectedPlayerInput {
    inputSource: InputSourceNames;
    deviceId?: string;
    channel: number;
}

const PLAYER_INPUTS_LOCAL_STORAGE_KEY = 'playerselectedinputs';

class InputManager {
    private playerInputs: SelectedPlayerInput[] = storage.getValue(PLAYER_INPUTS_LOCAL_STORAGE_KEY) ?? [];

    constructor() {
        // @ts-expect-error
        const isE2ETests = !!window.isE2ETests;

        if (this.playerInputs.length === 0) {
            /* eslint-disable @typescript-eslint/no-unused-vars */
            const Input = process.env.NODE_ENV === 'development' && !isE2ETests ? 'Dummy' : 'Microphone';
            const Input1 = 'Microphone';
            /* eslint-enable @typescript-eslint/no-unused-vars */

            this.setPlayerInput(0, Input, 0, 'default');
            this.setPlayerInput(1, Input, 1, 'default');
        }
    }

    public getPlayerFrequency = (playerNumber: number) => {
        const frequencies = this.sourceNameToInput(this.playerInputs[playerNumber].inputSource).getFrequencies(
            this.playerInputs[playerNumber].deviceId,
        );

        return frequencies[this.playerInputs[playerNumber].channel];
    };

    public getPlayerVolume = (playerNumber: number) => {
        const frequencies = this.sourceNameToInput(this.playerInputs[playerNumber].inputSource).getVolumes(
            this.playerInputs[playerNumber].deviceId,
        );

        return frequencies[this.playerInputs[playerNumber].channel];
    };

    public getPlayerInputLag = (playerNumber: number) =>
        this.sourceNameToInput(this.playerInputs[playerNumber].inputSource).getInputLag();

    public setPlayerInput = (playerNumber: number, source: InputSourceNames, channel = 0, deviceId?: string) => {
        const newInput = { inputSource: source, deviceId, channel };
        const oldInput = this.playerInputs[playerNumber];
        this.playerInputs[playerNumber] = newInput;

        storage.storeValue(PLAYER_INPUTS_LOCAL_STORAGE_KEY, this.playerInputs);
        events.playerInputChanged.dispatch(playerNumber, oldInput, newInput);
    };

    public getPlayerInput = (playerNumber: number): SelectedPlayerInput | null =>
        this.playerInputs[playerNumber] ?? null;

    public startMonitoring = async () => {
        Promise.all(
            this.playerInputs.map((playerInput) =>
                this.sourceNameToInput(playerInput.inputSource).startMonitoring(playerInput.deviceId),
            ),
        );
    };

    public stopMonitoring = async () => {
        Promise.all(
            this.playerInputs.map((playerInput) => this.sourceNameToInput(playerInput.inputSource).stopMonitoring()),
        );
    };

    public getInputs = () => this.playerInputs;

    // todo: Create eg. "InputSourceManager" and have the logic there?
    private sourceNameToInput = (sourceName: InputSourceNames) => {
        if (sourceName === MicrophoneInputSource.inputName) return MicInput;
        if (sourceName === DrawingTestInputSource.inputName) return DrawingTestInput;
        if (sourceName === RemoteMicrophoneInputSource.inputName) return RemoteMicInput;
        return dummyInput;
    };
}

export default new InputManager();
