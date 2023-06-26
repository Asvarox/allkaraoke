import events from 'GameEvents/GameEvents';
import DrawingTestInput from 'Scenes/Game/Singing/Input/DrawingTestInput';
import dummyInput from 'Scenes/Game/Singing/Input/DummyInput';
import MicInput from 'Scenes/Game/Singing/Input/MicInput';
import RemoteMicInput from 'Scenes/Game/Singing/Input/RemoteMicInput';
import { DrawingTestInputSource } from 'Scenes/SelectInput/InputSources/DrawingTest';
import { InputSourceNames } from 'Scenes/SelectInput/InputSources/interfaces';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';
import PlayersManager from 'PlayersManager';

export interface SelectedPlayerInput {
    source: InputSourceNames;
    deviceId?: string;
    channel: number;
}

class InputManager {
    private isMonitoring = false;

    constructor() {
        events.inputListChanged.subscribe(async () => {
            if (this.isMonitoring) {
                await this.stopMonitoring();
                this.startMonitoring();
            }
        });
    }

    public getPlayerFrequency = (playerNumber: number) => {
        const input = PlayersManager.getPlayer(playerNumber).input;
        const frequencies = this.sourceNameToInput(input.source).getFrequencies(input.deviceId);

        return frequencies[input.channel];
    };

    public getPlayerVolume = (playerNumber: number) => {
        const input = PlayersManager.getPlayer(playerNumber).input;
        const volumes = this.sourceNameToInput(input.source).getVolumes(input.deviceId);

        return volumes[input.channel];
    };

    public getPlayerInputLag = (playerNumber: number) =>
        this.sourceNameToInput(PlayersManager.getPlayer(playerNumber).input.source).getInputLag();

    public startMonitoring = async () => {
        await Promise.all(
            PlayersManager.getPlayers().map((player) =>
                this.sourceNameToInput(player.input.source).startMonitoring(player.input.deviceId),
            ),
        );
        this.isMonitoring = true;
    };

    public stopMonitoring = async () => {
        await Promise.all(
            PlayersManager.getPlayers().map((player) =>
                this.sourceNameToInput(player.input.source).stopMonitoring(player.input.deviceId),
            ),
        );
        this.isMonitoring = false;
    };

    public monitoringStarted = () => this.isMonitoring;

    // todo: Create eg. "InputSourceManager" and have the logic there?
    public sourceNameToInput = (sourceName: InputSourceNames) => {
        if (sourceName === MicrophoneInputSource.inputName) return MicInput;
        if (sourceName === DrawingTestInputSource.inputName) return DrawingTestInput;
        if (sourceName === RemoteMicrophoneInputSource.inputName) return RemoteMicInput;
        return dummyInput;
    };
}

export default new InputManager();
