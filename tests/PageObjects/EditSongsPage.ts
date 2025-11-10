import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { SongsTable } from '../components/songs-table';

type songActionsType = 'hide' | 'restore' | 'edit' | 'download' | 'delete';

export class EditSongsPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  songsTable = new SongsTable(this.page, this.context, this.browser);

  public getSongElement(songID: string) {
    const songSelector = this.songsTable.getSongIDSelector(songID);
    return this.page.locator(`${songSelector}`).first();
  }

  public getSongActionButton(songID: string, action: songActionsType) {
    const songSelector = this.songsTable.getSongIDSelector(songID);
    return this.page.locator(`${songSelector}[data-test="${action}-song"]`);
  }

  public async hideSong(songID: string) {
    await this.songsTable.searchSongs(songID);
    await this.getSongActionButton(songID, 'hide').click();
  }

  public async expectSongToBeHidden(songID: string) {
    await this.songsTable.searchSongs(songID);
    await expect(this.getSongActionButton(songID, 'restore')).toBeVisible();
  }

  public async restoreSong(songID: string) {
    await this.songsTable.searchSongs(songID);
    await this.getSongActionButton(songID, 'restore').click();
  }

  public async expectSongToBeVisible(songID: string) {
    await this.songsTable.searchSongs(songID);
    await expect(this.getSongActionButton(songID, 'hide')).toBeVisible();
  }

  public async editSong(songID: string) {
    await this.songsTable.searchSongs(songID);
    await this.getSongActionButton(songID, 'edit').click();
  }

  public async downloadSong(songID: string) {
    await this.songsTable.searchSongs(songID);
    await this.getSongActionButton(songID, 'download').click();
  }

  public async deleteSong(songID: string) {
    await this.songsTable.searchSongs(songID);
    await this.getSongActionButton(songID, 'delete').click();
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
