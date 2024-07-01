import fs from 'fs';
import path from 'path';
import puppeteer, { Browser, PuppeteerLaunchOptions } from 'puppeteer';
import { RenderedRoute } from './types';

export default class Renderer {
  private _browser?: Browser;

  async init(): Promise<void> {
    const options: PuppeteerLaunchOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    this._browser = await puppeteer.launch(options);
  }

  async destroy(): Promise<void> {
    await this._browser?.close();
  }

  async renderRoute(basePath: string, route: string, port: number, selector: string): Promise<RenderedRoute> {
    if (!this._browser) {
      throw Error('Headless browser instance not started. Failed to prerender.');
    }

    const page = await this._browser.newPage();
    await page.goto(`http://localhost:${port}${path.join(basePath, route)}`);
    await page.waitForSelector(selector, { timeout: 10000 });
    const html = await page.content();

    return { route, html };
  }

  async saveToFile(staticDir: string, renderedRoute: RenderedRoute): Promise<void> {
    const target = path.join(staticDir, renderedRoute.route, 'index.html');
    const directory = path.dirname(target);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(target, renderedRoute.html);
  }
}
