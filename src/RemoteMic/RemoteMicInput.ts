import { SenderInterface } from 'RemoteMic/Network/Server/Transport/interface';
import { NetworkMessages, NetworkSetPermissionsMessage } from 'RemoteMic/Network/messages';
import sendMessage from 'RemoteMic/Network/sendMessage';
import { getPingTime } from 'RemoteMic/Network/utils';

class RemoteMicInput {
    private frequencies: number[] | number[][] = [0];
    private volumes = [0];

    private requestReadinessPromise: null | Promise<boolean> = null;

    public constructor(private connection: SenderInterface) {}

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
                const listener = (data: NetworkMessages) => {
                    if (data.t === 'confirm-readiness') {
                        resolve(true);
                        this.connection.off('data', listener);
                        this.requestReadinessPromise = null;
                    }
                };

                this.connection.on('data', listener);

                sendMessage(this.connection, 'request-readiness');
            });
        }
        return this.requestReadinessPromise!;
    };
    startMonitoring = async () => {
        sendMessage(this.connection, 'start-monitor');

        this.connection?.on('data', this.handleRTCData);
    };

    stopMonitoring = async () => {
        sendMessage(this.connection, 'stop-monitor');

        this.connection?.off('data', this.handleRTCData);
    };

    private handleRTCData = (data: NetworkMessages) => {
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
    constructor(public id: string, public name: string, public connection: SenderInterface) {
        this.input = new RemoteMicInput(connection);

        this.pingClient();
    }

    public getInput = () => this.input;

    public setPlayerNumber = (playerNumber: number | null) => {
        sendMessage(this.connection, 'set-player-number', { playerNumber });
    };

    public onDisconnect = () => {
        if (this.pingInterval !== null) {
            clearInterval(this.pingInterval);
        }
    };

    public setPermission = (level: NetworkSetPermissionsMessage['level']) => {
        sendMessage<NetworkSetPermissionsMessage>(this.connection, 'set-permissions', { level });
    };

    private isPinging = false;
    private latency: number = 9999;

    public onPong = () => {
        this.latency = getPingTime() - this.pingTime;
        this.isPinging = false;

        this.pingClient();
    };

    private pingClient = () => {
        this.pingInterval = setTimeout(() => {
            this.pingTime = getPingTime();
            this.isPinging = true;
            sendMessage(this.connection, 'ping');
        }, 1000);
    };

    public getLatency = () => (this.isPinging ? getPingTime() - this.pingTime : this.latency);

    public getPingTime = () => this.pingTime;
}
