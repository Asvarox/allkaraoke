import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class MainMenuPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get singSongElement() {
    return this.page.getByTestId('sing-a-song');
  }

  public async goToSingSong() {
    await this.singSongElement.click();
  }

  public async navigateToSongListWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, 'sing-a-song', remoteMic);
  }

  public async goToSetupMicrophones() {
    await this.page.getByTestId('select-input').click();
  }

  public async goToSetting() {
    await this.page.getByTestId('settings').click();
  }

  public async goToJukebox() {
    await this.page.getByTestId('jukebox').click();
  }

  public get manageButton() {
    return this.page.getByTestId('manage-songs');
  }

  public async goToManageSongs() {
    await this.manageButton.click();
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
