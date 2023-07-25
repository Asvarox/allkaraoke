import { WebRTCEvents, WebRTCSetPermissionsEvent } from 'RemoteMic/Network/events';
import { getPingTime } from 'RemoteMic/Network/utils';
import Peer from 'peerjs';
import sendEvent from './Network/sendEvent';

class RemoteMicInput {
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
        console.log('requestReadiness');
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
        sendEvent(this.connection, 'set-player-number', { playerNumber });
    };

    public onDisconnect = () => {
        if (this.pingInterval !== null) {
            clearInterval(this.pingInterval);
        }
    };

    public setPermission = (level: WebRTCSetPermissionsEvent['level']) => {
        sendEvent<WebRTCSetPermissionsEvent>(this.connection, 'set-permissions', { level });
    };

    private isPinging = false;
    private latency: number = 9999;

    public onPong = () => {
        this.latency = getPingTime() - this.pingTime;
        this.isPinging = false;

        this.pingClient();
    };

    private pingClient = () => {
        console.log('pinging', this.id);
        this.pingInterval = setTimeout(() => {
            this.pingTime = getPingTime();
            this.isPinging = true;
            sendEvent(this.connection, 'ping');
        }, 1000);
    };

    public getLatency = () => (this.isPinging ? getPingTime() - this.pingTime : this.latency);

    public getPingTime = () => this.pingTime;
}
