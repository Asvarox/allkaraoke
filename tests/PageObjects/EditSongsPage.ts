import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class EditSongsPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async searchSongs(songName: string) {
    await this.page.locator('[placeholder="Search"]').fill(songName);
  }

  public async hideSong(songName: string, songID: string) {
    await this.searchSongs(songName);
    await this.page.locator(`[data-test="hide-song"][data-song="${songID}"]`).click();
  }

  public async expectSongToBeHidden(songName: string, songID: string) {
    await this.searchSongs(songName);
    await expect(this.page.locator(`[data-test="restore-song"][data-song="${songID}"]`)).toBeVisible();
  }

  public async restoreSong(songName: string, songID: string) {
    await this.searchSongs(songName);
    await this.page.locator(`[data-test="restore-song"][data-song="${songID}"]`).click();
  }

  public async expectSongToBeVisible(songName: string, songID: string) {
    await this.searchSongs(songName);
    await expect(this.page.locator(`[data-test="hide-song"][data-song = "${songID}"]`)).toBeVisible();
  }

  public async editSong(songName: string, songID: string) {
    await this.searchSongs(songName);
    await this.page.locator(`[data-test="edit-song"][data-song="${songID}"]`).click();
  }

  public async goToMainMenu() {
    await this.page.getByTestId('main-menu-link').click();
  }

  public async goToImportUltrastar() {
    await this.page.getByTestId('convert-song').click();
  }

  public async disagreeToShareAddSongs() {
    await this.page.getByTestId('share-songs-disagree').click();
  }
}
