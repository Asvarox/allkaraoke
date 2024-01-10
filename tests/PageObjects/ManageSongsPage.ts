import { Browser, BrowserContext, Page } from '@playwright/test';

export class ManageSongsPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async goToEditSongs() {
    await this.page.getByTestId('edit-songs').click();
  }

  public async goToSelectSongLanguage() {
    await this.page.getByTestId('exclude-languages').click();
  }
}
