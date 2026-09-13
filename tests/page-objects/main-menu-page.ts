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

  /**
   * By URL, not by clicking: the Jukebox has no main-menu tile any more, but the screen itself is
   * still shipped and reachable, so the specs that cover it still need a way in.
   */
  public async goToJukebox() {
    await this.page.goto('/jukebox/?e2e-test');
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
