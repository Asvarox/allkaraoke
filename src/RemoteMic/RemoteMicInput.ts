import Peer from 'peerjs';
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
