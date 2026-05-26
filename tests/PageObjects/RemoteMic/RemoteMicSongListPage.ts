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
    await this.clearSearch();
    await this.yourListButton.click();
  }

  public async expectFavouriteListToBeSelected() {
    await this.clearSearch();
    await expect(this.yourListButton).toHaveAttribute('data-focused', 'true');
  }

  public async expectFavouriteListToContainNumberOfSongs(numberOfSongs: string) {
    await this.clearSearch();
    await expect(this.yourListButton).toContainText(numberOfSongs);
  }

  public get allSongsButton() {
    return this.page.getByTestId('all-songs-button');
  }

  public async goToAllSongsPlaylist() {
    await this.clearSearch();
    await this.allSongsButton.click();
  }

  public async expectAllSongsPlaylistToBeSelected() {
    await this.clearSearch();
    await expect(this.allSongsButton).toHaveAttribute('data-focused', 'true');
  }

  public get searchInput() {
    return this.page.getByTestId('search-input');
  }

  public get searchButton() {
    return this.page.getByTestId('search-button');
  }

  public get searchCloseButton() {
    return this.page.getByTestId('search-close-button');
  }

  private async ensureSearchInputVisible() {
    if (await this.searchInput.isVisible()) {
      return;
    }

    await this.searchButton.click();
    await expect(this.searchInput).toBeVisible();
  }

  private async clearSearch() {
    if (await this.searchCloseButton.isVisible()) {
      await this.searchCloseButton.click();
    }
  }

  public async searchTheSong(songName: string) {
    await this.ensureSearchInputVisible();
    await this.searchInput.fill(songName);
  }

  public get songLanguageFilter() {
    return this.page.getByTestId('song-language-filter');
  }

  public async goToSelectSongLanguage() {
    await this.clearSearch();
    await this.songLanguageFilter.click();
  }

  public get selectSongButton() {
    return this.page.getByTestId('select-song-button');
  }

  public async chooseSongForPreview(songID: string) {
    const songElement = this.getSongElement(songID);
    let hasUsedSearch = false;

    // Used to find grouped song
    if (await songElement.isHidden()) {
      const songNameFromID = songID.split('-')[1];
      await this.searchTheSong(songNameFromID);
      await expect(songElement).toBeVisible();
      hasUsedSearch = true;
    }

    await songElement.locator(this.selectSongButton).click();
    if (hasUsedSearch) {
      await this.clearSearch();
    }
  }

  public getGroupedArtistSongsElement(artistName: string) {
    return this.page.getByTestId(`song-group-${artistName}`);
  }

  public getExpandedArtistSongsGroupElement(artistName: string) {
    return this.getGroupedArtistSongsElement(artistName).getByText('CLOSE');
  }

  public async clickToExpandSongsGroup(artistName: string) {
    await this.getGroupedArtistSongsElement(artistName).click();
  }

  public async clickToCloseSongsGroup(artistName: string) {
    await this.getExpandedArtistSongsGroupElement(artistName).click();
  }

  public async expectArtistSongCountToBe(artistName: string, count: string) {
    await expect(this.getGroupedArtistSongsElement(artistName)).toHaveAttribute('data-song-count', count);
  }
}
