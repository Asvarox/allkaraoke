import DrawingTestInput from '~/modules/GameEngine/Input/DrawingTestInput';
import dummyInput from '~/modules/GameEngine/Input/DummyInput';
import InputInterface from '~/modules/GameEngine/Input/Interface';
import MicInput from '~/modules/GameEngine/Input/MultiMicInput';
import RemoteMicInput from '~/modules/GameEngine/Input/RemoteMicInput';
import events from '~/modules/GameEvents/GameEvents';
import PlayersManager from '~/modules/Players/PlayersManager';
import { DrawingTestInputSource } from '~/routes/SelectInput/InputSources/DrawingTest';
import { MicrophoneInputSource } from '~/routes/SelectInput/InputSources/Microphone';
import { RemoteMicrophoneInputSource } from '~/routes/SelectInput/InputSources/Remote';
import { InputSourceNames } from '~/routes/SelectInput/InputSources/interfaces';

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

  public getInputStatus = (playerNumber: 0 | 1 | 2 | 3) => {
    const player = PlayersManager.getPlayer(playerNumber);
    if (!player) return 'unavailable';

    const source = this.sourceNameToInput(player.input.source);

    return source.getStatus(player.input.deviceId, player.input.channel);
  };

  public getPlayerFrequency = (playerNumber: 0 | 1 | 2 | 3) => {
    const input = PlayersManager.getPlayer(playerNumber)?.input;
    // Player got removed
    if (!input) return 0;

    const frequencies = this.sourceNameToInput(input.source).getFrequencies(input.deviceId);

    return frequencies[input.channel];
  };

  public clearPlayerCachedFrequencies = (playerNumber: 0 | 1 | 2 | 3) => {
    const input = PlayersManager.getPlayer(playerNumber)?.input;
    // Player got removed
    if (!input) return 0;

    this.sourceNameToInput(input.source).clearFrequencies(input.deviceId);
  };

  public getPlayerVolume = (playerNumber: 0 | 1 | 2 | 3) => {
    const input = PlayersManager.getPlayer(playerNumber)?.input;
    if (!input) {
      return 0;
    }
    const volumes = this.sourceNameToInput(input.source).getVolumes(input.deviceId);

    return volumes[input.channel];
  };

  public getPlayerInputLag = (playerNumber: 0 | 1 | 2 | 3) => {
    const input = PlayersManager.getPlayer(playerNumber)?.input;
    if (!input) {
      return 0;
    } else {
      return this.sourceNameToInput(input.source).getInputLag(input.deviceId);
    }
  };

  public startMonitoring = async () => {
    const allInputs = PlayersManager.getPlayers().map((player) => player.input);
    await Promise.all(
      allInputs.map((input) => this.sourceNameToInput(input.source).startMonitoring(input.deviceId, allInputs)),
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
  public sourceNameToInput = (sourceName: InputSourceNames): InputInterface => {
    if (sourceName === MicrophoneInputSource.inputName) return MicInput;
    // @ts-expect-error only-for-testing input not included in the typings
    if (sourceName === DrawingTestInputSource.inputName) return DrawingTestInput;
    if (sourceName === RemoteMicrophoneInputSource.inputName) return RemoteMicInput;
    return dummyInput;
  };
}

export default new InputManager();
