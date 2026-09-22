import DrawingTestInput from '~/modules/game-engine/input/drawing-test-input';
import dummyInput from '~/modules/game-engine/input/dummy-input';
import InputInterface from '~/modules/game-engine/input/interface';
import MicInput from '~/modules/game-engine/input/multi-mic-input';
import RemoteMicInput from '~/modules/game-engine/input/remote-mic-input';
import events from '~/modules/game-events/game-events';
import { PlayerNumber } from '~/modules/players/player-number';
import PlayersManager, { SelectedPlayerInput } from '~/modules/players/players-manager';
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

  /** Tail of the queue of pipeline transitions - see {@link serialize}. */
  private transitions: Promise<unknown> = Promise.resolve();

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

  /**
   * Runs pipeline transitions one after another. They each take a while to settle and only then
   * report what they did, so overlapping ones read a state that is already out of date and undo
   * each other's work - a stop begun before a start can finish after it and tear down the devices
   * that start had just opened. Queueing them means every transition sees where things actually
   * stand, and the one after it sees the result.
   *
   * A transition that fails is still a transition: the queue carries on rather than wedging.
   */
  private serialize = <T>(transition: () => Promise<T>): Promise<T> => {
    const result = this.transitions.then(transition, transition);
    this.transitions = result.catch(() => undefined);

    return result;
  };

  private startMonitoringNow = async () => {
    const allInputs = PlayersManager.getPlayers().map((player) => player.input);
    await Promise.all(
      allInputs.map((input) => this.sourceNameToInput(input.source).startMonitoring(input.deviceId, allInputs)),
    );
    this.isMonitoring = true;
  };

  private stopMonitoringNow = async (inputs: SelectedPlayerInput[]) => {
    await Promise.all(inputs.map((input) => this.sourceNameToInput(input.source).stopMonitoring(input.deviceId)));
    this.isMonitoring = false;
  };

  /**
   * Which inputs a stop is going to release, decided as the caller asks rather than when the queue
   * gets round to it. `PlayersManager.changeInput` stops monitoring and *then* swaps the player's
   * input over; read any later and the swap has already landed, so the stop would release the device
   * being switched to and leave the one it was called to release running.
   */
  private currentInputs = () => PlayersManager.getPlayers().map((player) => player.input);

  /**
   * Starts the pipeline outright, for callers that drive it rather than hold it - the game engine
   * runs it for the length of a song. Idempotent per device: it picks up inputs added since, and
   * never tears a running one down. Anything that just wants a mic while it's on screen should
   * take a hold with {@link requestMonitoring} instead.
   */
  public startMonitoring = () => this.serialize(this.startMonitoringNow);

  /** Counterpart to {@link startMonitoring}. Stops the pipeline regardless of who wanted it. */
  public stopMonitoring = () => {
    const inputs = this.currentInputs();

    return this.serialize(() => this.stopMonitoringNow(inputs));
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
    const isFirstHolder = this.holders === 0;
    this.holders++;

    void this.serialize(async () => {
      // Asked once the queue gets here, not when the hold was taken: a stop this hold is waiting
      // behind would otherwise still read as "running" and leave the group thinking the pipeline is
      // someone else's.
      if (isFirstHolder) {
        this.startedByHolders = !this.isMonitoring;
      }

      await this.startMonitoringNow();
      // A remote input rejects when its transport drops mid-connection. Nothing can be done about
      // it here - monitoring simply isn't running - and the release below reads the holder count
      // rather than the outcome, so let it go rather than leave an unhandled rejection behind.
    }).catch(() => undefined);

    let released = false;

    return () => {
      if (released) return;
      released = true;
      this.holders--;
      const inputs = this.currentInputs();

      void this.serialize(async () => {
        // By now someone else may be holding it open - either a nested screen, or this very
        // component re-mounting, which is what React's StrictMode does on every mount in dev.
        // Tearing the pipeline down there would leave the screen that just mounted without a mic.
        if (this.holders === 0 && this.startedByHolders) {
          await this.stopMonitoringNow(inputs);
        }
      }).catch(() => undefined);
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
