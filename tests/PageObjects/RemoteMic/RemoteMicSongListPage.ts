import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { RemoteTabBar } from '../RemoteMic/remoteComponents/RemoteTabBar';
import { RemoteToolbar } from '../RemoteMic/remoteComponents/RemoteToolbar';

export class RemoteMicSongListPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  remoteTabBar = new RemoteTabBar(this.page, this.context, this.browser);
  remoteToolbar = new RemoteToolbar(this.page, this.context, this.browser);

  public getSongElement(songID: string) {
    return this.page.getByTestId(songID);
  }

  public get addSongButton() {
    return this.page.getByTestId('add-song-button');
  }

  public async addSongToFavouriteList(songID: string) {
    await this.getSongElement(songID).locator(this.addSongButton).click();
  }

  public get removeSongButton() {
    return this.page.getByTestId('remove-song-button');
  }

  public async removeSongFromFavouriteList(songID: string) {
    await this.getSongElement(songID).locator(this.removeSongButton).click();
  }

  public async expectSongToBeVisible(songID: string) {
    await expect(this.getSongElement(songID)).toBeVisible();
  }

  public async expectSongNotToBeVisible(songID: string) {
    await expect(this.getSongElement(songID)).not.toBeVisible();
  }

  public get yourListButton() {
    return this.page.getByTestId('your-list-button');
  }

  public async goToFavouriteList() {
    await this.yourListButton.click();
  }

  public async expectFavouriteListToBeSelected() {
    await expect(this.yourListButton).toHaveAttribute('data-active', 'true');
  }

  public async expectFavouriteListToContainNumberOfSongs(numberOfSongs: string) {
    await expect(this.yourListButton).toContainText(numberOfSongs);
  }

  public get allSongsButton() {
    return this.page.getByTestId('all-songs-button');
  }

  public async goToAllSongsPlaylist() {
    await this.allSongsButton.click();
  }

  public async expectAllSongsPlaylistToBeSelected() {
    await expect(this.allSongsButton).toHaveAttribute('data-active', 'true');
  }

  public get searchInput() {
    return this.page.getByTestId('search-input');
  }

  public async searchTheSong(songName: string) {
    await this.searchInput.fill(songName);
  }

  public get songLanguageFilter() {
    return this.page.getByTestId('song-language-filter');
  }

  public async goToSelectSongLanguage() {
    await this.songLanguageFilter.click();
  }

  public get selectSongButton() {
    return this.page.getByTestId('select-song-button');
  }

  public async chooseSongForPreview(songID: string) {
    await this.getSongElement(songID).locator(this.selectSongButton).click();
  }
}
