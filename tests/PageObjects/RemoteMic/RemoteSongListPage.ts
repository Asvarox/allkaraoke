import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class RemoteSongListPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public getSongElement(songID: string) {
    return this.page.getByTestId(songID);
  }

  public async expectSongToBeVisible(songID: string) {
    await expect(this.getSongElement(songID)).toBeVisible();
  }

  public async expectSongNotToBeVisible(songID: string) {
    await expect(this.getSongElement(songID)).not.toBeVisible();
  }

  public async goToMicrophonePage() {
    await this.page.getByTestId('menu-microphone').click();
  }
}
