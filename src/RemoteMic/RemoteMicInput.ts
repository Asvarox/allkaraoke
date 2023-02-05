import Peer from 'peerjs';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';
import GameStateEvents, { events } from 'Scenes/Game/Singing/GameState/GameStateEvents';
import InputInterface from 'Scenes/Game/Singing/Input/Interface';
import { WebRTCEvents } from 'RemoteMic/Network/events';
import sendEvent from './Network/sendEvent';

class PhoneInput implements InputInterface {
    private frequencies = [0];
    private volumes = [0];

    public constructor(private connection: Peer.DataConnection) {}

    getChannelsCount = () => 1;

    getFrequencies = () => this.frequencies;
    getVolumes = () => this.volumes;

    getInputLag = () => 200;

    startMonitoring = async () => {
        sendEvent(this.connection, 'start-monitor');

        this.connection?.on('data', this.handleRTCData);
    };

    stopMonitoring = async () => {
        sendEvent(this.connection, 'stop-monitor');

        this.connection?.off('data', this.handleRTCData);
    };

    private handleRTCData = (data: WebRTCEvents) => {
        if (data.type === 'freq') {
            this.frequencies = data.freqs;
            this.volumes = data.volumes;
        }
    };
}

export class Phone {
    private input: PhoneInput;
    constructor(public id: string, public name: string, public connection: Peer.DataConnection) {
        this.input = new PhoneInput(connection);
    }

    public getInput = () => this.input;

    public setPlayerNumber = (playerNumber: number | null) => {
        this.connection?.send({ type: 'set-player-number', playerNumber } as WebRTCEvents);
    };
}

class PhoneManager {
    private phones: Phone[] = [];

    constructor() {
        events.playerInputChanged.subscribe((playerNumber, oldInput, newInput) => {
            if (oldInput?.inputSource === RemoteMicrophoneInputSource.inputName) {
                const playerNumber = InputManager.getInputs().findIndex(
                    (input) => input.inputSource === 'Remote Microphone' && input.deviceId === oldInput.deviceId,
                );
                const unselectedPhone = this.getPhoneById(oldInput.deviceId!);

                unselectedPhone?.setPlayerNumber(playerNumber >= 0 ? playerNumber : null);
            }
            if (newInput?.inputSource === 'Remote Microphone') {
                const selectedPhone = this.getPhoneById(newInput.deviceId!);
                console.log('selectedPhone', oldInput, newInput);

                selectedPhone?.setPlayerNumber(playerNumber);
            }
        });
        events.phoneConnected.subscribe(({ id }) => {
            const playerNumberIndex = InputManager.getRawInputs().findIndex(
                (input) => input.inputSource === 'Remote Microphone' && input.deviceId === id,
            );

            if (playerNumberIndex > -1) {
                this.getPhoneById(id)?.setPlayerNumber(playerNumberIndex);
            }
        });
    }

    public addPhone = (id: string, name: string, connection: Peer.DataConnection) => {
        this.phones.push(new Phone(id, name, connection));
        GameStateEvents.phoneConnected.dispatch({ id, name });
    };

    public removePhone = (id: string) => {
        const removedPhone = this.phones.find((phone) => phone.id === id);
        this.phones = this.phones.filter((phone) => phone.id !== id);
        if (removedPhone) GameStateEvents.phoneDisconnected.dispatch(removedPhone);
    };

    public getPhones = () => this.phones;

    public getPhoneById = (id: string) => this.phones.find((phone) => phone.id === id);
}

export default new PhoneManager();
