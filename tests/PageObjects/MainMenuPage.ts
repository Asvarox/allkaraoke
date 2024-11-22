import { Browser, BrowserContext, Page } from '@playwright/test';
import { ToolbarComponent } from '../components/ToolbarComponent';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class MainMenuPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  toolbarComponent = new ToolbarComponent(this.page, this.context, this.browser);

  public get singSongButton() {
    return this.page.getByTestId('sing-a-song');
  }

  public async goToSingSong() {
    await this.singSongButton.click();
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
}
