import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class ToolbarComponent {
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
    return this.page.locator('[data-test="toggle-fullscreen"] svg');
  }

  public async toggleFullscreen() {
    await this.fullscreenElement.click();
  }

  public async expectFullscreenToBeOff() {
    await expect(this.fullscreenElement).toHaveAttribute('data-testid', 'FullscreenIcon');
  }

  public async expectFullscreenToBeOn() {
    await expect(this.fullscreenElement).toHaveAttribute('data-testid', 'FullscreenExitIcon');
  }

  public async quickConnectPhone() {
    await this.page.getByTestId('quick-connect-phone').click();
  }

  public async closeQuickConnectPhone() {
    await this.page.getByTestId('quick-connect-close').click();
  }
}
