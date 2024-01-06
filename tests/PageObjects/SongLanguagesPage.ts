import { Browser, BrowserContext, Page } from '@playwright/test';

export class SongLanguagesPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async continueAndGoToSongList() {
    await this.page.getByTestId('close-exclude-languages').click();
  }

  public getLanguageEntry(language: string) {
    return this.page.getByTestId(`lang-${language}`);
  }
}
