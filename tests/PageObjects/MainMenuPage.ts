import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class MainMenuPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public get singSongElement() {
    return this.page.getByTestId('sing-a-song');
  }

  public async goToSingSong() {
    await this.singSongElement.click();
  }

  public async goToJukebox() {
    await this.page.getByTestId('jukebox').click();
  }

  public async goToManageSongs() {
    await this.page.getByTestId('manage-songs').click();
  }

  public get helpButton() {
    return this.page.getByTestId('toggle-help');
  }

  public async toggleHelp() {
    await this.helpButton.click();
  }

  public get helpContainerElement() {
    return this.page.getByTestId('help-container');
  }

  public async expectHelpContainerToBeVisible() {
    await expect(this.helpContainerElement).toHaveAttribute('data-collapsed', 'false');
  }

  public async expectHelpContainerToBeHidden() {
    await expect(this.helpContainerElement).toHaveAttribute('data-collapsed', 'true');
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
}
