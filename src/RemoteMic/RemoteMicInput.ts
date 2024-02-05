import { SenderInterface } from 'RemoteMic/Network/Server/Transport/interface';
import { NetworkMessages, NetworkSetPermissionsMessage } from 'RemoteMic/Network/messages';
import sendMessage from 'RemoteMic/Network/sendMessage';
import { getPingTime } from 'RemoteMic/Network/utils';

class RemoteMicInput {
  private frequencies: number[] | number[][] = [0];
  private volumes = [0];

  private requestReadinessPromise: null | Promise<boolean> = null;

  public constructor(
    private connection: SenderInterface,
    private inputLag: number,
  ) {}

  getChannelsCount = () => 1;

  getFrequencies = () => {
    const freqs = this.frequencies;

    return freqs;
  };

  clearFrequencies = () => {
    if (Array.isArray(this.frequencies[0])) {
      this.frequencies = [this.frequencies[0].at(-1)!];
    }
  };
  getVolumes = () => this.volumes;

  getInputLag = () => {
    return this.inputLag;
  };

  setInputLag = (inputLag: number) => {
    this.inputLag = inputLag;
  };

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
    this.connection?.off('data', this.handleRTCData);
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
  constructor(
    public id: string,
    public name: string,
    public connection: SenderInterface,
    lag: number,
  ) {
    this.input = new RemoteMicInput(connection, lag);

    this.pingClient();
  }

  public getInput = () => this.input;

  public setPlayerNumber = (playerNumber: 0 | 1 | 2 | 3 | null) => {
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
