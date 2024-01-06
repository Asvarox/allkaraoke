import { Browser, BrowserContext, Page } from '@playwright/test';

export class EditSongsPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async searchSongs(songName: string) {
    await this.page.locator('[placeholder="Search"]').fill(songName);
  }

  public async hideSong(songName: string, songID: string) {
    this.searchSongs(songName);
    await this.page.locator(`[data-test="hide-song"][data-song="${songID}"]`).click();
  }

  public async restoreSong(songName: string, songID: string) {
    this.searchSongs(songName);
    await this.page.locator(`[data-test="restore-song"][data-song="${songID}"]`).click();
  }

  public async editSong(songName: string, songID: string) {
    this.searchSongs(songName);
    await this.page.locator(`[data-test="edit-song"][data-song="${songID}"]`).click();
  }

  public async goToMainMenu() {
    await this.page.getByTestId('main-menu-link').click();
  }
}
