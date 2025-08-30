import { debounce } from 'es-toolkit';
import GameState from 'modules/GameEngine/GameState/GameState';
import InputManager from 'modules/GameEngine/Input/InputManager';
import events from 'modules/GameEvents/GameEvents';
import RemoteMicServer from 'modules/RemoteMic/Network/Server';
import RemoteMicManager from 'modules/RemoteMic/RemoteMicManager';
import storage from 'modules/utils/storage';
import inputSourceListManager from 'routes/SelectInput/InputSources';
import { InputSourceNames } from 'routes/SelectInput/InputSources/interfaces';

const SELECTED_INPUTS_KEY = 'playerselectedinputs';
export const MAX_PLAYERS = 4;

export interface SelectedPlayerInput {
  source: InputSourceNames;
  deviceId?: string;
  channel: number;
}

export class PlayerEntity {
  public nameOverride: string = '';
  constructor(
    public number: 0 | 1 | 2 | 3,
    public input: SelectedPlayerInput,
    public name?: string,
  ) {}

  public changeInput = (input: InputSourceNames, channel = 0, deviceId?: string) => {
    let restartMonitoringPromise: null | Promise<void> = null;
    if (InputManager.monitoringStarted()) {
      restartMonitoringPromise = InputManager.stopMonitoring();
    }

    const newInput: SelectedPlayerInput = { source: input, deviceId, channel };
    const oldInput = this.input;
    this.input = newInput;

    events.playerInputChanged.dispatch(this.number, oldInput, newInput);

    if (restartMonitoringPromise) {
      restartMonitoringPromise.then(InputManager.startMonitoring);
    }
  };

  public toJSON = () => ({
    number: this.number,
    input: this.input,
    name: this.name,
  });

  public getName = () => {
    return this.nameOverride || (this.name ?? `Player #${this.number + 1}`);
  };

  public isDefaultName = () => this.name === undefined;

  public setName = (newName: string) => {
    const oldName = this.name;
    this.name = newName;
    events.playerNameChanged.dispatch(this.number, oldName);
  };

  public static fromJSON = (data: ReturnType<PlayerEntity['toJSON']>) =>
    new PlayerEntity(data.number, data.input, data.name);
}

class PlayersManager {
  private minPlayerNumber = 2;

  private players: PlayerEntity[] = [];
  private requestingPromise: Promise<any> | null = null;
  public constructor() {
    const storedPlayers = storage.session.getItem<ReturnType<PlayerEntity['toJSON']>[]>(SELECTED_INPUTS_KEY) ?? [];
    console.log('Restoring players from storage', storedPlayers);
    if (storedPlayers.length) {
      this.players = storedPlayers.map(PlayerEntity.fromJSON);

      if (this.getPlayers().some((player) => player.input.source === 'Microphone')) {
        // If any microphones are selected, load the list
        inputSourceListManager.loadMics();
      }
      if (this.getPlayers().some((player) => player.input.source === 'Remote Microphone')) {
        // If there are some remote mics, restart the server
        RemoteMicServer.start();
      }
    } else {
      this.players = [
        new PlayerEntity(0, { source: 'Dummy', deviceId: 'default', channel: 0 }),
        new PlayerEntity(1, { source: 'Dummy', deviceId: 'default', channel: 1 }),
      ];
    }

    events.playerInputChanged.subscribe((playerNumber, _, newInput) => {
      const player = this.getPlayer(playerNumber);
      if (!newInput || !player) return;

      if (newInput.source === 'Remote Microphone') {
        const microphone = RemoteMicManager.getRemoteMicById(newInput.deviceId!);

        if (microphone) {
          player.nameOverride = microphone.name;
        }
      } else {
        player.nameOverride = '';
      }

      this.storePlayers();
    });

    events.playerNameChanged.subscribe(debounce(this.storePlayers, 1000));

    events.remoteMicConnected.subscribe(({ id, name }) => {
      this.getPlayers().forEach((player) => {
        if (player.input.source === 'Remote Microphone' && player.input.deviceId === id && player.getName() !== name) {
          player.nameOverride = name;
        }
      });
    });
  }

  private storePlayers = () => {
    storage.session.setItem(
      SELECTED_INPUTS_KEY,
      this.getPlayers().map((player) => player.toJSON()),
    );
  };

  public requestReadiness = async () => {
    if (!this.requestingPromise) {
      this.requestingPromise = new Promise((resolve) => {
        const request = async () => {
          // todo fix this -- if there's an input that is not connected, no input will be able to
          // confirm readiness. It should request what it can and watch for input list changes
          // and could also be simplified to only care about remote mic.
          // Found when for some reason regular mic was assigned to a player without an id. getInputForPlayerSelected
          // returned null and the readiness was never requested for remote mic connected for the other player.
          const allInputsConnected = !this.getPlayers()
            .filter((player) => player.input.source === 'Remote Microphone')
            .some((player) => inputSourceListManager.getInputForPlayerSelected(player.input, false) === null);

          if (allInputsConnected) {
            await Promise.all(
              this.getPlayers().map((player) =>
                InputManager.sourceNameToInput(player.input.source)
                  .requestReadiness(player.input.deviceId)
                  .then(() => {
                    events.readinessConfirmed.dispatch(player.input.deviceId!);
                  }),
              ),
            );
            events.inputListChanged.unsubscribe(request);
            this.requestingPromise = null;
            resolve(true);
          }
        };

        events.inputListChanged.subscribe(request);
        request();
      });
    }

    return this.requestingPromise;
  };

  public getPlayers = () => this.players;
  public getPlayer = (number: number) => this.players.find((player) => player.number === number);

  public getMinPlayerNumber = () => this.minPlayerNumber;
  public setMinPlayerNumber = (minPlayerNumber: number) => {
    const previousMinPlayerNumber = this.minPlayerNumber;
    this.minPlayerNumber = minPlayerNumber;
    events.minPlayerNumberChanged.dispatch(previousMinPlayerNumber, minPlayerNumber);
  };

  public addPlayer = (playerNumber: 0 | 1 | 2 | 3) => {
    if (GameState.isPlaying() || this.getPlayer(playerNumber)) {
      return;
    }
    const newPlayer = new PlayerEntity(playerNumber, { source: 'Dummy', deviceId: 'default', channel: 0 });
    this.players.push(newPlayer);
    this.storePlayers();

    events.playerAdded.dispatch(newPlayer.number);
    events.playerInputChanged.dispatch(newPlayer.number, undefined, newPlayer.input);

    return newPlayer;
  };

  public removePlayer = (playerNumber: 0 | 1 | 2 | 3) => {
    if (GameState.isPlaying()) {
      return;
    }
    const player = this.getPlayer(playerNumber);

    if (player) {
      this.players = this.players.filter((player) => player.number !== playerNumber);
      if (this.players.length < this.minPlayerNumber) {
        this.addPlayer(
          new Array(MAX_PLAYERS).fill(0).find((_, index) => !this.players.find((player) => player.number === index))!,
        );
      }
      this.storePlayers();
      events.playerRemoved.dispatch(player);
    }
  };

  public getInputs = () => this.getPlayers().map((player) => player.input);
}

export default new PlayersManager();
