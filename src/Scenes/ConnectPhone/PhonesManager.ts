import Peer from 'peerjs';
import GameStateEvents from '../Game/Singing/GameState/GameStateEvents';
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
        this.connection?.send({ type: 'start-monitor' });

        this.connection?.on('data', this.handleRTCData);
    };

    stopMonitoring = async () => {
        this.connection?.send({ type: 'stop-monitor' });

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
}

class PhoneManager {
    private phones: Phone[] = [];

    public addPhone = (id: string, name: string, connection: Peer.DataConnection) => {
        this.phones.push(new Phone(id, name, connection));
        GameStateEvents.phoneConnected.dispatch(id);
    };

    public removePhone = (id: string) => {
        this.phones = this.phones.filter((phone) => phone.id !== id);
        GameStateEvents.phoneDisconnected.dispatch(id);
    };

    public getPhones = () => this.phones;

    public getPhoneById = (id: string) => this.phones.find((phone) => phone.id === id);
}

export default new PhoneManager();
