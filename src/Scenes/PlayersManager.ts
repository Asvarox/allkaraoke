import InputManager, { SelectedPlayerInput } from 'Scenes/Game/Singing/Input/InputManager';
import storage from 'utils/storage';
import events from 'GameEvents/GameEvents';
import { InputSourceNames } from 'Scenes/SelectInput/InputSources/interfaces';
import inputSourceListManager from 'Scenes/SelectInput/InputSources';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import { debounce } from 'lodash-es';

const PLAYER_INPUTS_LOCAL_STORAGE_KEY = 'playerselectedinputs';

export class PlayerEntity {
    public nameOverride: string = '';
    constructor(public number: number, public input: SelectedPlayerInput, public name?: string) {}

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
    private players: PlayerEntity[] = [];
    private requestingPromise: Promise<any> | null = null;
    public constructor() {
        const storedPlayers =
            storage.getValue<ReturnType<PlayerEntity['toJSON']>[]>(PLAYER_INPUTS_LOCAL_STORAGE_KEY) ?? [];
        if (storedPlayers.length) {
            this.players = storedPlayers.map(PlayerEntity.fromJSON);

            if (this.getPlayers().some((player) => player.input.source === 'Microphone')) {
                // If any microphones are selected, load the list
                inputSourceListManager.loadMics();
            }
        } else {
            this.players = [
                new PlayerEntity(0, { source: 'Dummy', deviceId: 'default', channel: 0 }),
                new PlayerEntity(1, { source: 'Dummy', deviceId: 'default', channel: 1 }),
            ];
        }

        events.playerInputChanged.subscribe((playerNumber, _, newInput) => {
            if (newInput.source === 'Remote Microphone') {
                const microphone = RemoteMicManager.getRemoteMicById(newInput.deviceId!);

                if (microphone) {
                    this.getPlayer(playerNumber).nameOverride = microphone.name;
                }
            } else {
                this.getPlayer(playerNumber).nameOverride = '';
            }

            this.storePlayers();
        });

        events.playerNameChanged.subscribe(debounce(this.storePlayers, 1000));

        events.remoteMicConnected.subscribe(({ id, name }) => {
            this.getPlayers().forEach((player) => {
                if (
                    player.input.source === 'Remote Microphone' &&
                    player.input.deviceId === id &&
                    player.getName() !== name
                ) {
                    player.nameOverride = name;
                }
            });
        });
    }

    private storePlayers = () => {
        storage.storeValue(
            PLAYER_INPUTS_LOCAL_STORAGE_KEY,
            this.getPlayers().map((player) => player.toJSON()),
        );
    };

    public requestReadiness = async () => {
        if (!this.requestingPromise) {
            this.requestingPromise = new Promise((resolve) => {
                const request = async () => {
                    const allInputsConnected = !this.getPlayers().some(
                        (player) => inputSourceListManager.getInputForPlayerSelected(player.input, false) === null,
                    );

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
    public getPlayer = (number: number) => this.players[number];

    public getInputs = () => this.getPlayers().map((player) => player.input);
}

export default new PlayersManager();
