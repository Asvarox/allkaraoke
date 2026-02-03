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
    await expect(this.yourListButton).toHaveAttribute('data-focused', 'true');
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
    await expect(this.allSongsButton).toHaveAttribute('data-focused', 'true');
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
    const selectTheSong = this.getSongElement(songID).locator(this.selectSongButton).click();

    // Used to find grouped song
    if (await this.getSongElement(songID).isHidden()) {
      const songNameFromID = songID.split('-')[1];
      await this.searchTheSong(songNameFromID);
      await expect(this.getSongElement(songID)).toBeVisible();
    }
    await selectTheSong;
    await this.searchInput.clear();
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
