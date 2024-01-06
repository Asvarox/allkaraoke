import { Browser, BrowserContext, Page } from '@playwright/test';

export class SongEditingPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public get urlSourceInput() {
    return this.page.locator('[data-test="source-url"] input');
  }

  public get authorNameInput() {
    return this.page.locator('[data-test="author-name"] input');
  }

  public get authorUrlInput() {
    return this.page.locator('[data-test="author-url"] input');
  }

  public get videoUrlInput() {
    return this.page.locator('[data-test="video-url"] input');
  }

  public async goNext() {
    await this.page.getByTestId('next-button').click();
  }

  public get songLyrics() {
    return this.page.getByTestId('sync-lyrics');
  }

  public get songLanguageInput() {
    return this.page.getByTestId('song-language');
  }

  public get releaseYearInput() {
    return this.page.locator('[data-test="release-year"] input');
  }

  public get bpmSongInput() {
    return this.page.locator('[data-test="song-bpm"] input');
  }
}
