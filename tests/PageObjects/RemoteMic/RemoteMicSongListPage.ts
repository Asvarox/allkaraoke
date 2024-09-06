import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class RemoteMicSongListPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public getSongElement(songID: string) {
    return this.page.getByTestId(songID);
  }

  public get addSongButton() {
    return this.page.getByTestId('add-song-button');
  }

  public async addSongToFavouriteList(songID: string) {
    await this.getSongElement(songID).locator(this.addSongButton).click();
  }

  public get unselectSongButton() {
    return this.page.getByTestId('unselect-song-button');
  }

  public async removeSongFromFavouriteList(songID: string) {
    await this.getSongElement(songID).locator(this.unselectSongButton).click();
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
}
