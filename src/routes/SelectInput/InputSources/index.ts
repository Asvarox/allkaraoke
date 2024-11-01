import events from 'modules/GameEvents/GameEvents';
import { SelectedPlayerInput } from 'modules/Players/PlayersManager';
import { DrawingTestInputSource } from 'routes/SelectInput/InputSources/DrawingTest';
import {
  InputSourceList,
  InputSourceManagerInterface,
  InputSourceNames,
} from 'routes/SelectInput/InputSources/interfaces';
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
    };
    if (import.meta.env.MODE === 'test') {
      // @ts-expect-error only-for-test input is not in the list
      this.inputList[DrawingTestInputSource.inputName] = this.initialiseInputSource(DummyInputSource);
    }
  }

  private initialiseInputSource = <T extends InputSourceManagerInterface>(source: T, lazily = false) => {
    if (!lazily) {
      source.getInputs().then((list) => {
        this.inputList[source.inputName].list = list;
        this.inputList[source.inputName].initialised = true;
        events.inputListChanged.dispatch(true);

        source.subscribeToListChange(async () => {
          this.inputList[source.inputName].list = await source.getInputs();
          events.inputListChanged.dispatch(false);
        });
      });
    }

    return {
      list: [],
      getDefault: source.getDefault,
      initialised: false,
    };
  };

  public loadMics = () => {
    if (!this.inputList.Microphone.list.length) {
      this.inputList.Microphone = this.initialiseInputSource(MicrophoneInputSource);
    }
  };

  public getInputList = () => this.inputList;

  public isPlayerInputInitialised = (input: SelectedPlayerInput) => {
    return this.inputList[input.source].initialised;
  };

  public getInputForPlayerSelected = (input: SelectedPlayerInput, returnDefault = true) => {
    const source = this.inputList[input.source];

    return (
      source.list.find((item) => item.id === selectedPlayerInputToId(input)) ??
      (returnDefault ? source.getDefault() : null)
    );
  };
}
export default new InputSourceListManager();
