import InputInterface from '~/modules/GameEngine/Input/Interface';

class DrawingTestInput implements InputInterface {
  private frequencies: [number, number] = [440, 410];
  private volumes: [number, number] = [1, 1];

  public startMonitoring = async () => {};

  public getFrequencies = () => this.frequencies;
  public getVolumes = () => this.volumes;
  public clearFrequencies = () => undefined;

  public stopMonitoring = async () => {};

  public getInputLag = () => 0;

  public setFrequency = (channel: 0 | 1, value: number) => (this.frequencies[channel] = value);

  public requestReadiness = () => Promise.resolve(true);

  public getStatus = () => 'ok' as const;
}

export default new DrawingTestInput();
