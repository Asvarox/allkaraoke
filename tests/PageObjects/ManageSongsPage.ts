import { Browser, BrowserContext, Page } from '@playwright/test';

export class ManageSongsPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get editSongsButton() {
    return this.page.getByTestId('edit-songs');
  }

  public async goToEditSongs() {
    await this.editSongsButton.click();
  }

  public async goToSelectSongLanguage() {
    await this.page.getByTestId('exclude-languages').click();
  }

  public get manageSetlistsButton() {
    return this.page.getByTestId('edit-setlists');
  }

  public async goToManageSetlists() {
    await this.manageSetlistsButton.click();
  }

  public async goBackToMainMenu() {
    await this.page.getByTestId('back-button').click();
  }
}
