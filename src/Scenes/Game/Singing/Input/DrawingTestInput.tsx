import InputInterface from './Interface';

class DrawingTestInput implements InputInterface {
  private frequencies: [number, number] = [440, 410];
  private volumes: [number, number] = [1, 1];

  public startMonitoring = async () => {};

  public getFrequencies = (deviceId?: string) => this.frequencies;
  public getVolumes = (deviceId?: string) => this.volumes;
  public clearFrequencies = (deviceId?: string) => undefined;

  public stopMonitoring = async (deviceId?: string) => {};

  public getInputLag = () => 0;

  public setFrequency = (channel: 0 | 1, value: number) => (this.frequencies[channel] = value);

  public requestReadiness = () => Promise.resolve(true);

  public getStatus = () => 'ok' as const;
}

export default new DrawingTestInput();
