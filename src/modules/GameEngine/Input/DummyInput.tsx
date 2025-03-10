import InputInterface from 'modules/GameEngine/Input/Interface';

class DummyInput implements InputInterface {
  private frequencies: [number, number] = [410, 210];
  private volumes: [number, number] = [1, 1];
  private timestamp = 0;
  private interval: ReturnType<typeof global.setInterval> | null = null;

  private isMonitoring = false;

  public startMonitoring = async () => {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.interval = global.setInterval(() => {
      this.timestamp = this.timestamp + 32;

      const secPart = 0; // this.timestamp % 1000;
      if (secPart > 232 && secPart < 708) {
        this.frequencies[0] = 0;
        this.frequencies[1] = 0;
      } else {
        this.frequencies[0] = Math.sin(this.timestamp / 1000) * 50 + 100;
        this.frequencies[1] = Math.cos(this.timestamp / 1000) * 50 + 200;

        // this.volumes = this.frequencies.map((freq) => (1.5 + Math.random()) / 80) as [number, number];
      }
    }, 32);
  };

  public getFrequencies = () => this.frequencies;
  public getVolumes = () => this.volumes;
  public clearFrequencies = () => undefined;

  public stopMonitoring = async () => {
    if (!this.isMonitoring) return;
    this.isMonitoring = false;
    if (this.interval) {
      global.clearInterval(this.interval);
    }
  };

  public getInputLag = () => 150;
  public requestReadiness = () => Promise.resolve(true);

  public getStatus = () => 'ok' as const;
}

export default new DummyInput();
