import http from 'http';
import { AddressInfo } from 'net';
import handler from 'serve-handler';

export default class Server {
  runningPort = 0;

  private readonly _port: number;
  private _instance?: http.Server;

  constructor(port: number) {
    this._port = port;
  }

  init(dir: string): Promise<void> {
    this._instance = http.createServer((request, response) => {
      return handler(request, response, {
        public: dir,
        rewrites: [{ source: '/**', destination: '/index.html' }],
      });
    });

    return new Promise((resolve) => {
      this._instance?.listen(this._port, () => {
        this.runningPort = (this._instance?.address() as AddressInfo).port;
        console.log(`Running at http://localhost:${this.runningPort}`);

        resolve();
      });
    });
  }

  async destroy(): Promise<void> {
    return new Promise((resolve) => {
      this._instance?.close(() => resolve());
    });
  }
}
