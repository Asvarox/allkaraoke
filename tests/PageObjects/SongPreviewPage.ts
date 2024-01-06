import { Browser, BrowserContext, Page } from '@playwright/test';

export class SongPreviewPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async goNext() {
    await this.page.getByTestId('next-step-button').click();
  }

  public async playTheSong() {
    await this.page.getByTestId('play-song-button').click();
  }
}
