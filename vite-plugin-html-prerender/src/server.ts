import express, { Express } from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import path from 'path';

export default class Server {
  runningPort = 0;

  private readonly _port: number;
  private readonly _server: Express;
  private _instance?: http.Server;

  constructor(port: number) {
    this._port = port;
    this._server = express();
  }

  init(dir: string, basePath: string): Promise<void> {
    this._server.use(basePath, express.static(dir, { dotfiles: 'allow' }));
    this._server.get('*', (_req, res) => res.sendFile(path.join(dir, 'index.html')));

    return new Promise((resolve) => {
      this._instance = this._server.listen(this._port, () => {
        this.runningPort = (this._instance?.address() as AddressInfo).port;
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
