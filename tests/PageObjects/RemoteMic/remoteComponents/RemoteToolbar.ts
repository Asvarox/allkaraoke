import { Browser, BrowserContext, Page, expect } from '@playwright/test';

export class RemoteToolbar {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get fullscreenElement() {
    return this.page.locator('[data-test="toggle-fullscreen"] svg');
  }

  public async toggleFullscreen() {
    await this.fullscreenElement.click();
  }

  public async expectFullscreenToBeOn() {
    await expect(this.fullscreenElement).toHaveAttribute('data-testid', 'FullscreenExitIcon');
  }

  public async expectFullscreenToBeOff() {
    await expect(this.fullscreenElement).toHaveAttribute('data-testid', 'FullscreenIcon');
  }

  public async ensureFullscreenIsOff() {
    const fullscreenStatus = await this.fullscreenElement.getAttribute('data-testid');

    if (fullscreenStatus === 'FullscreenExitIcon') {
      await this.toggleFullscreen();
      await this.expectFullscreenToBeOff();
    }
  }
}
