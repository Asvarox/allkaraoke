import Peer from 'peerjs';
import InputInterface from 'Scenes/Game/Singing/Input/Interface';
import { WebRTCEvents } from 'RemoteMic/Network/events';
import sendEvent from './Network/sendEvent';
import { getPingTime } from 'RemoteMic/Network/utils';

class RemoteMicInput implements InputInterface {
    private frequencies: number[] | number[][] = [0];
    private volumes = [0];

    private requestReadinessPromise: null | Promise<boolean> = null;

    public constructor(private connection: Peer.DataConnection) {}

    getChannelsCount = () => 1;

    getFrequencies = () => {
        const freqs = this.frequencies;

        if (Array.isArray(freqs[0])) {
            this.frequencies = [freqs[0].at(-1)!];
        }
        return freqs;
    };
    getVolumes = () => this.volumes;

    getInputLag = () => 200;

    requestReadiness = () => {
        if (!this.requestReadinessPromise) {
            this.requestReadinessPromise = new Promise<boolean>((resolve) => {
                const listener = (data: WebRTCEvents) => {
                    if (data.t === 'confirm-readiness') {
                        resolve(true);
                        this.connection.off('data', listener);
                        this.requestReadinessPromise = null;
                    }
                };

                this.connection.on('data', listener);

                sendEvent(this.connection, 'request-readiness');
            });
        }
        return this.requestReadinessPromise!;
    };
    startMonitoring = async () => {
        sendEvent(this.connection, 'start-monitor');

        this.connection?.on('data', this.handleRTCData);
    };

    stopMonitoring = async () => {
        sendEvent(this.connection, 'stop-monitor');

        this.connection?.off('data', this.handleRTCData);
    };

    private handleRTCData = (data: WebRTCEvents) => {
        if (data.t === 'freq') {
            this.frequencies = [data[0], data[0]];
            this.volumes = [data[1], data[1]];
        }
    };
}

export class RemoteMic {
    private input: RemoteMicInput;
    private pingTime: number = 9999;
    private pingInterval: ReturnType<typeof setTimeout> | null = null;
    constructor(public id: string, public name: string, public connection: Peer.DataConnection) {
        this.input = new RemoteMicInput(connection);

        this.pingClient();
    }

    public getInput = () => this.input;

    public setPlayerNumber = (playerNumber: number | null) => {
        this.connection?.send({ t: 'set-player-number', playerNumber } as WebRTCEvents);
    };

    public onDisconnect = () => {
        if (this.pingInterval !== null) {
            clearInterval(this.pingInterval);
        }
    };

    private latency: number = 9999;

    public onPong = () => {
        this.latency = getPingTime() - this.pingTime;

        this.pingClient();
    };

    private pingClient = () => {
        this.pingInterval = setTimeout(() => {
            this.pingTime = getPingTime();
            sendEvent(this.connection, 'ping');
        }, 1000);
    };

    public getLatency = () => this.latency;

    public getPingTime = () => this.pingTime;
}
