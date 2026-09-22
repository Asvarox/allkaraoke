import DrawingTestInput from '~/modules/game-engine/input/drawing-test-input';
import dummyInput from '~/modules/game-engine/input/dummy-input';
import InputInterface from '~/modules/game-engine/input/interface';
import MicInput from '~/modules/game-engine/input/multi-mic-input';
import RemoteMicInput from '~/modules/game-engine/input/remote-mic-input';
import events from '~/modules/game-events/game-events';
import { PlayerNumber } from '~/modules/players/player-number';
import PlayersManager from '~/modules/players/players-manager';
import { DrawingTestInputSource } from '~/routes/select-input/input-sources/drawing-test';
import { InputSourceNames } from '~/routes/select-input/input-sources/interfaces';
import { MicrophoneInputSource } from '~/routes/select-input/input-sources/microphone';
import { RemoteMicrophoneInputSource } from '~/routes/select-input/input-sources/remote';

class InputManager {
  private isMonitoring = false;

  /** How many outstanding {@link requestMonitoring} holds there are. */
  private holders = 0;

  /**
   * Whether the pipeline belongs to the holders rather than to a direct {@link startMonitoring}
   * caller (the game engine, say), who is owed it for as long as they want it. Ownership is a
   * property of the group, not of whoever releases last: it is decided when the first hold is taken
   * and stands until the last one is given back.
   */
  private startedByHolders = false;

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

  /**
   * Asks for the pipeline to be running for as long as the caller needs it, and hands back the
   * release to call when it doesn't. Callers state what they need and nothing else - overlapping
   * requests, and the pipeline's own async lifecycle, are this manager's problem:
   *
   * - The pipeline is started once for however many holders there are, and torn down when the last
   *   one lets go. A screen nested inside another that also holds it (the input setup inside the
   *   online wizard inside a room) can therefore ask for it without taking it away from its parent.
   * - A hold released and re-taken in the same tick keeps it running. React's StrictMode remounts
   *   every effect in dev, so the naive teardown would leave the screen that just mounted without a
   *   mic for good.
   * - A pipeline someone started directly is never stopped here, however the holds come and go.
   *
   * Releasing twice does nothing the second time.
   */
  public requestMonitoring = () => {
    if (this.holders === 0) {
      this.startedByHolders = !this.isMonitoring;
    }
    this.holders++;

    // A remote input rejects when its transport drops mid-connection. Nothing can be done about it
    // here - monitoring simply isn't running - but the release below still has to wait for the
    // attempt to settle, so absorb it at the source rather than leaving an unhandled rejection.
    const startPromise = this.startMonitoring().catch(() => undefined);

    let released = false;

    return () => {
      if (released) return;
      released = true;
      this.holders--;

      // startMonitoring() only flips `isMonitoring` once its own async work settles. Stopping right
      // away would let a start that finishes later win the race and leave the pipeline running with
      // nobody holding it. Wait for the attempt to settle, then look at where things actually stand.
      void startPromise.finally(() => {
        if (this.holders === 0 && this.startedByHolders) {
          void this.stopMonitoring();
        }
      });
    };
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
