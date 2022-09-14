import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { DrawingTestInputSource } from 'Scenes/SelectInput/InputSources/DrawingTest';
import { InputSource, InputSourceManagerInterface, InputSourceNames } from 'Scenes/SelectInput/InputSources/interfaces';
import { DummyInputSource } from './Dummy';
import { MicrophoneInputSource } from './Microphone';
import { RemoteMicrophoneInputSource } from './Remote';

class InputSourceListManager {
    private readonly inputList: Record<
        InputSourceNames,
        {
            list: InputSource[];
            getDefault: () => string | null;
        }
    >;

    constructor() {
        this.inputList = {
            [MicrophoneInputSource.inputName]: this.initialiseInputSource(MicrophoneInputSource),
            [DummyInputSource.inputName]: this.initialiseInputSource(DummyInputSource),
            [RemoteMicrophoneInputSource.inputName]: this.initialiseInputSource(RemoteMicrophoneInputSource),
            [DrawingTestInputSource.inputName]: this.initialiseInputSource(DrawingTestInputSource),
        };
    }

    private initialiseInputSource = <T extends InputSourceManagerInterface>(source: T) => {
        source.getInputs().then((list) => {
            this.inputList[source.inputName].list = list;
            events.inputListChanged.dispatch();

            source.subscribeToListChange(async () => {
                this.inputList[source.inputName].list = await source.getInputs();
                events.inputListChanged.dispatch();
            });
        });

        return {
            list: [],
            getDefault: source.getDefault,
        };
    };

    public getInputList = () => this.inputList;
}
export default new InputSourceListManager();
