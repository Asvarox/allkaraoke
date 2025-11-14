import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { SongsTable } from '../components/songs-table';

export class EditSongsPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  songsTable = new SongsTable(this.page, this.context, this.browser);

  public async hideSong(songID: string) {
    await this.songsTable.searchSongs(songID);
    await this.page.locator(`[data-test="hide-song"][data-song="${songID}"]`).click();
  }

  public async expectSongToBeHidden(songID: string) {
    await this.songsTable.searchSongs(songID);
    await expect(this.page.locator(`[data-test="restore-song"][data-song="${songID}"]`)).toBeVisible();
  }

  public async restoreSong(songID: string) {
    await this.songsTable.searchSongs(songID);
    await this.page.locator(`[data-test="restore-song"][data-song="${songID}"]`).click();
  }

  public async expectSongToBeVisible(songID: string) {
    await this.songsTable.searchSongs(songID);
    await expect(this.page.locator(`[data-test="hide-song"][data-song = "${songID}"]`)).toBeVisible();
  }

  public async editSong(songID: string) {
    await this.songsTable.searchSongs(songID);
    await this.page.locator(`[data-test="edit-song"][data-song="${songID}"]`).click();
  }

  public async downloadSong(songID: string) {
    await this.songsTable.searchSongs(songID);
    await this.page.locator(`[data-test="download-song"][data-song="${songID}"]`).click();
  }

  public deleteSongButton(songID: string) {
    return this.page.locator(`[data-test="delete-song"][data-song="${songID}"]`);
  }

  public async deleteSong(songID: string) {
    await this.songsTable.searchSongs(songID);
    await this.deleteSongButton(songID).click();
  }

  public async goToMainMenu() {
    await this.page.getByTestId('main-menu-link').click();
  }

  public get importUltrastarButton() {
    return this.page.getByTestId('convert-song');
  }

  public async goToConvertSong() {
    await this.importUltrastarButton.click();
  }

  public async disagreeToShareAddSongs() {
    await this.page.getByTestId('share-songs-disagree').click();
  }

  public get shareSongSwitch() {
    return this.page.getByTestId('share-songs-switch').getByRole('checkbox');
  }
}
