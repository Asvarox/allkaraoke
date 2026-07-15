import { Browser, BrowserContext, expect, Page } from '@playwright/test';

import { Toolbar } from '../components/toolbar';
import navigateWithKeyboard from '../steps/navigate-with-keyboard';

export class MainMenuPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  toolbar = new Toolbar(this.page, this.context, this.browser);

  public get singSongButton() {
    return this.page.getByTestId('sing-a-song');
  }

  public async goToSingSong() {
    await this.singSongButton.click();
  }

  public async navigateToSongListWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, 'sing-a-song', remoteMic);
  }

  public get setupMicrophonesButton() {
    return this.page.getByTestId('select-input');
  }

  public async goToInputSelectionPage() {
    await this.setupMicrophonesButton.click();
  }

  public async goToSetting() {
    await this.page.getByTestId('settings').click();
  }

  public async goToJukebox() {
    await this.page.getByTestId('jukebox').click();
  }

  public async goToHistory() {
    await this.page.getByTestId('history').click();
  }

  public async waitForContainer() {
    await expect(this.singSongButton).toBeVisible();
  }

  public get manageButton() {
    return this.page.getByTestId('manage-songs');
  }

  public async goToManageSongs() {
    await this.manageButton.click();
  }
}
