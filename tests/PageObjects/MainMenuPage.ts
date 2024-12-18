import { Browser, BrowserContext, Page } from '@playwright/test';
import { Toolbar } from '../components/Toolbar';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

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

  public get manageButton() {
    return this.page.getByTestId('manage-songs');
  }

  public async goToManageSongs() {
    await this.manageButton.click();
  }
}
