import fs from 'fs';
import path from 'path';
import { Browser, chromium, LaunchOptions } from 'playwright';
import { RenderedRoute } from './types';

export default class Renderer {
  private _browser?: Browser;
  private initPromise?: Promise<void>;

  async init(): Promise<void> {
    if (!this.initPromise) {
      const options: LaunchOptions = {
        args: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox'],
      };
      this.initPromise = chromium.launch(options).then((browser) => {
        this._browser = browser;
      });
    }

    return this.initPromise;
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
    try {
      await page.waitForSelector(selector, { timeout: 7_500, state: 'attached' });
      await page.waitForLoadState('domcontentloaded');
    } catch (error) {
      console.error(`Failed to prerender route: ${route}`, error);
    }

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
