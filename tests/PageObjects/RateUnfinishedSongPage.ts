import { Browser, BrowserContext, Page } from '@playwright/test';

export class RateUnfinishedSongPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get rateSongContainer() {
    return this.page.getByTestId('rate-song-container');
  }

  public get exitSongButton() {
    return this.page.getByTestId('button-song-ok');
  }

  public async skipSongRating() {
    await this.exitSongButton.click();
  }
}
