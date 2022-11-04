import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import DrawingTestInput from 'Scenes/Game/Singing/Input/DrawingTestInput';
import dummyInput from 'Scenes/Game/Singing/Input/DummyInput';
import MicInput from 'Scenes/Game/Singing/Input/MicInput';
import RemoteMicInput from 'Scenes/Game/Singing/Input/RemoteMicInput';
import { DrawingTestInputSource } from 'Scenes/SelectInput/InputSources/DrawingTest';
import { InputSourceNames } from 'Scenes/SelectInput/InputSources/interfaces';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';
import isDev from 'utils/isDev';
import storage from 'utils/storage';

export interface SelectedPlayerInput {
    inputSource: InputSourceNames;
    deviceId?: string;
    channel: number;
}

const PLAYER_INPUTS_LOCAL_STORAGE_KEY = 'playerselectedinputs';

class InputManager {
    private isMonitoring = false;
    private playerInputs: SelectedPlayerInput[] = storage.getValue(PLAYER_INPUTS_LOCAL_STORAGE_KEY) ?? [];

    constructor() {
        if (this.playerInputs.length === 0) {
            /* eslint-disable @typescript-eslint/no-unused-vars */
            const Input = isDev() ? 'Dummy' : 'Microphone';
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
        // In case input change while monitoring stop monitoring everything and start monitoring after the change happen
        let restartMonitoringPromise: null | Promise<void> = null;
        if (this.isMonitoring) {
            restartMonitoringPromise = this.stopMonitoring();
        }

        const newInput = { inputSource: source, deviceId, channel };
        const oldInput = this.playerInputs[playerNumber];
        this.playerInputs[playerNumber] = newInput;

        storage.storeValue(PLAYER_INPUTS_LOCAL_STORAGE_KEY, this.playerInputs);
        events.playerInputChanged.dispatch(playerNumber, oldInput, newInput);

        if (restartMonitoringPromise) {
            restartMonitoringPromise.then(this.startMonitoring);
        }
    };

    public getPlayerInput = (playerNumber: number): SelectedPlayerInput | null =>
        this.playerInputs[playerNumber] ?? null;

    public startMonitoring = async () => {
        await Promise.all(
            this.playerInputs.map((playerInput) =>
                this.sourceNameToInput(playerInput.inputSource).startMonitoring(playerInput.deviceId),
            ),
        );
        this.isMonitoring = true;
    };

    public stopMonitoring = async () => {
        await Promise.all(
            this.playerInputs.map((playerInput) =>
                this.sourceNameToInput(playerInput.inputSource).stopMonitoring(playerInput.deviceId),
            ),
        );
        this.isMonitoring = false;
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
