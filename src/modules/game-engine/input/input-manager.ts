import { PlayerNumber } from '~/modules/players/player-number';
import DrawingTestInput from '~/modules/game-engine/input/drawing-test-input';
import dummyInput from '~/modules/game-engine/input/dummy-input';
import InputInterface from '~/modules/game-engine/input/interface';
import MicInput from '~/modules/game-engine/input/multi-mic-input';
import RemoteMicInput from '~/modules/game-engine/input/remote-mic-input';
import events from '~/modules/game-events/game-events';
import PlayersManager from '~/modules/players/players-manager';
import { DrawingTestInputSource } from '~/routes/select-input/input-sources/drawing-test';
import { InputSourceNames } from '~/routes/select-input/input-sources/interfaces';
import { MicrophoneInputSource } from '~/routes/select-input/input-sources/microphone';
import { RemoteMicrophoneInputSource } from '~/routes/select-input/input-sources/remote';

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

  public getInputStatus = (playerNumber: PlayerNumber) => {
    const player = PlayersManager.getPlayer(playerNumber);
    if (!player) return 'unavailable';

    const source = this.sourceNameToInput(player.input.source);

    return source.getStatus(player.input.deviceId, player.input.channel);
  };

  public getPlayerFrequency = (playerNumber: PlayerNumber) => {
    const input = PlayersManager.getPlayer(playerNumber)?.input;
    // Player got removed
    if (!input) return 0;

    const frequencies = this.sourceNameToInput(input.source).getFrequencies(input.deviceId);

    return frequencies[input.channel];
  };

  public clearPlayerCachedFrequencies = (playerNumber: PlayerNumber) => {
    const input = PlayersManager.getPlayer(playerNumber)?.input;
    // Player got removed
    if (!input) return 0;

    this.sourceNameToInput(input.source).clearFrequencies(input.deviceId);
  };

  public getPlayerVolume = (playerNumber: PlayerNumber) => {
    const input = PlayersManager.getPlayer(playerNumber)?.input;
    if (!input) {
      return 0;
    }
    const volumes = this.sourceNameToInput(input.source).getVolumes(input.deviceId);

    return volumes[input.channel];
  };

  public getPlayerInputLag = (playerNumber: PlayerNumber) => {
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
