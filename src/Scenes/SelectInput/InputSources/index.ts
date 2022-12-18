import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { SelectedPlayerInput } from 'Scenes/Game/Singing/Input/InputManager';
import { DrawingTestInputSource } from 'Scenes/SelectInput/InputSources/DrawingTest';
import {
    InputSourceList,
    InputSourceManagerInterface,
    InputSourceNames,
} from 'Scenes/SelectInput/InputSources/interfaces';
import { DummyInputSource } from './Dummy';
import { MicrophoneInputSource } from './Microphone';
import { RemoteMicrophoneInputSource } from './Remote';

const selectedPlayerInputToId = (input: SelectedPlayerInput) => `${input.deviceId};${input.channel}`;

class InputSourceListManager {
    private inputList: Record<InputSourceNames, InputSourceList>;

    constructor() {
        this.inputList = {
            [MicrophoneInputSource.inputName]: this.initialiseInputSource(MicrophoneInputSource, true),
            [DummyInputSource.inputName]: this.initialiseInputSource(DummyInputSource),
            [RemoteMicrophoneInputSource.inputName]: this.initialiseInputSource(RemoteMicrophoneInputSource),
            [DrawingTestInputSource.inputName]: this.initialiseInputSource(DrawingTestInputSource),
        };
    }

    private initialiseInputSource = <T extends InputSourceManagerInterface>(source: T, lazily = false) => {
        if (!lazily) {
            source.getInputs().then((list) => {
                this.inputList[source.inputName].list = list;
                events.inputListChanged.dispatch();

                source.subscribeToListChange(async () => {
                    this.inputList[source.inputName].list = await source.getInputs();
                    events.inputListChanged.dispatch();
                });
            });
        }

        return {
            list: [],
            getDefault: source.getDefault,
        };
    };

    public loadMics = () => {
        if (!this.inputList.Microphone.list.length) {
            this.inputList.Microphone = this.initialiseInputSource(MicrophoneInputSource);
        }
    };

    public getInputList = () => this.inputList;

    public getInputForPlayerSelected = (input: SelectedPlayerInput, returnDefault = true) => {
        const source = this.inputList[input.inputSource];
        return (
            source.list.find((item) => item.id === selectedPlayerInputToId(input)) ??
            (returnDefault ? source.getDefault() : null)
        );
    };
}
export default new InputSourceListManager();
