import Peer from 'peerjs';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';
import GameStateEvents, { events } from '../Game/Singing/GameState/GameStateEvents';
import InputInterface from '../Game/Singing/Input/Interface';
import { WebRTCEvents } from '../Phone/WebRTCClient';

class PhoneInput implements InputInterface {
    private frequencies = [0];
    private volumes = [0];

    public constructor(private connection: Peer.DataConnection) {}

    getChannelsCount = () => 1;

    getFrequencies = () => this.frequencies;
    getVolumes = () => this.volumes;

    getInputLag = () => 200;

    startMonitoring = async () => {
        this.connection?.send({ type: 'start-monitor' } as WebRTCEvents);

        this.connection?.on('data', this.handleRTCData);
    };

    stopMonitoring = async () => {
        this.connection?.send({ type: 'stop-monitor' } as WebRTCEvents);

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
                const unselectedPhone = this.phones.find((phone) => phone.id === oldInput.deviceId);
                console.log('unselectedPhone', unselectedPhone);

                unselectedPhone?.setPlayerNumber(null);
            }
            if (newInput?.inputSource === RemoteMicrophoneInputSource.inputName) {
                const selectedPhone = this.phones.find((phone) => phone.id === newInput.deviceId);
                console.log('selectedPhone', selectedPhone);

                selectedPhone?.setPlayerNumber(playerNumber);
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
