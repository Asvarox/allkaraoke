import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class EditSongsPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async searchSongs(songID: string) {
    await this.page.locator('[placeholder="Search"]').fill(songID);
  }

  public async hideSong(songID: string) {
    await this.searchSongs(songID);
    await this.page.locator(`[data-test="hide-song"][data-song="${songID}"]`).click();
  }

  public async expectSongToBeHidden(songID: string) {
    await this.searchSongs(songID);
    await expect(this.page.locator(`[data-test="restore-song"][data-song="${songID}"]`)).toBeVisible();
  }

  public async restoreSong(songID: string) {
    await this.searchSongs(songID);
    await this.page.locator(`[data-test="restore-song"][data-song="${songID}"]`).click();
  }

  public async expectSongToBeVisible(songID: string) {
    await this.searchSongs(songID);
    await expect(this.page.locator(`[data-test="hide-song"][data-song = "${songID}"]`)).toBeVisible();
  }

  public async editSong(songID: string) {
    await this.searchSongs(songID);
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
