import { Browser, BrowserContext, Page, expect } from '@playwright/test';

export class RemoteToolbar {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get fullscreenElement() {
    return this.page.getByTestId('toggle-fullscreen');
  }

  public async toggleFullscreen() {
    await this.fullscreenElement.click();
  }

  public async expectFullscreenToBeOn() {
    await expect.poll(() => this.page.evaluate(() => document.fullscreenElement !== null)).toBe(true);
  }

  public async expectFullscreenToBeOff() {
    await expect.poll(() => this.page.evaluate(() => document.fullscreenElement !== null)).toBe(false);
  }

  public async ensureFullscreenIsOff() {
    if (await this.page.evaluate(() => document.fullscreenElement !== null)) {
      await this.toggleFullscreen();
      await this.expectFullscreenToBeOff();
    }
  }
}
