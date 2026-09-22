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

  /** Everyone who currently wants the pipeline running, by the id they hold it under. */
  private holders = new Set<string>();

  private nextHolderId = 0;

  /** The inputs the pipeline was last opened for, so it can be closed for exactly those again. */
  private openedInputs: SelectedPlayerInput[] = [];

  /** Tail of the queue of pipeline transitions - see {@link serialize}. */
  private transitions: Promise<unknown> = Promise.resolve();

  constructor() {
    // A device appearing or disappearing changes what should be open, but not who wants it.
    events.inputListChanged.subscribe(() => {
      void this.reassertMonitoring();
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
   * each other's work - a close begun before an open can finish after it and tear down the devices
   * that open had just brought up. Queueing them means every transition sees where things actually
   * stand, and the one after it sees the result.
   *
   * A transition that fails is still a transition: the queue carries on rather than wedging. Its
   * rejection is absorbed here too - a remote input rejects when its transport drops mid-connection,
   * which means the pipeline isn't running, and nothing above this can do anything about that.
   */
  private serialize = (transition: () => Promise<void>) => {
    const result = this.transitions.then(transition, transition).catch(() => undefined);
    this.transitions = result;

    return result;
  };

  /** Brings up whatever the players are singing through now, and remembers it for {@link close}. */
  private open = async () => {
    const inputs = PlayersManager.getPlayers().map((player) => player.input);

    await Promise.all(
      inputs.map((input) => this.sourceNameToInput(input.source).startMonitoring(input.deviceId, inputs)),
    );
    this.openedInputs = inputs;
    this.isMonitoring = true;
  };

  /**
   * Closes what {@link open} brought up - the inputs as they were then, which is not necessarily
   * what the players are on now. A player switching microphone leaves the one they were using to be
   * closed, and it is only findable here.
   */
  private close = async () => {
    const inputs = this.openedInputs;
    this.openedInputs = [];

    await Promise.all(inputs.map((input) => this.sourceNameToInput(input.source).stopMonitoring(input.deviceId)));
    this.isMonitoring = false;
  };

  /**
   * Registers a holder and hands back its release; the pipeline runs for as long as anyone holds
   * it. Callers say what they need and nothing else - overlapping holds, and the pipeline's own
   * async lifecycle, are this manager's problem.
   *
   * `holderId` is for a caller whose start and release are in different places, like the game
   * engine running the mic for the length of a song; everyone else gets an id of their own and can
   * ignore this. Holding under an id already held is the same hold, not a second one.
   */
  public startMonitoring = (holderId: string = `holder-${this.nextHolderId++}`) => {
    this.holders.add(holderId);
    void this.serialize(this.open);

    // Returns nothing, so it can be handed straight to `useEffect` as its cleanup.
    return () => {
      void this.stopMonitoring(holderId);
    };
  };

  /**
   * Releases a hold, and with it the pipeline once nothing else is holding it. Taking the hold
   * again before the teardown gets its turn keeps it running: React's StrictMode remounts every
   * effect in dev, and a screen handing over to another that wants the mic too shouldn't have it
   * stop and start in between.
   *
   * Releasing something that isn't held does nothing.
   */
  public stopMonitoring = (holderId: string) => {
    if (!this.holders.delete(holderId)) return Promise.resolve();

    return this.serialize(async () => {
      if (this.holders.size > 0) return;

      await this.close();
    });
  };

  /**
   * Brings the running pipeline up to date with inputs that have changed underneath it - a player
   * switching microphone, a device appearing or going away. Closes what was open and opens what the
   * players are on now, in that order, so the device being switched away from is actually released.
   *
   * Does nothing when nobody is holding the pipeline: there is nothing running to bring up to date.
   */
  public reassertMonitoring = () => {
    if (this.holders.size === 0) return Promise.resolve();

    return this.serialize(async () => {
      await this.close();
      await this.open();
    });
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
