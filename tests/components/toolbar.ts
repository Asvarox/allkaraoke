import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class Toolbar {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get helpButton() {
    return this.page.getByTestId('toggle-help');
  }

  public async toggleHelp() {
    await this.helpButton.click();
  }

  public get helpContainerElement() {
    return this.page.getByTestId('help-container');
  }

  public get fullscreenElement() {
    return this.page.getByTestId('toggle-fullscreen');
  }

  public async toggleFullscreen() {
    await this.fullscreenElement.click();
  }

  public async expectFullscreenToBeOff() {
    await expect.poll(() => this.page.evaluate(() => document.fullscreenElement !== null)).toBe(false);
  }

  public async expectFullscreenToBeOn() {
    await expect.poll(() => this.page.evaluate(() => document.fullscreenElement !== null)).toBe(true);
  }

  public async ensureFullscreenIsOff() {
    if (await this.page.evaluate(() => document.fullscreenElement !== null)) {
      await this.toggleFullscreen();
      await this.expectFullscreenToBeOff();
    }
  }

  public async quickConnectPhone() {
    await this.page.getByTestId('quick-connect-phone').click();
  }

  public async closeQuickConnectPhone() {
    await this.page.getByTestId('quick-connect-close').click();
  }
}
