import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class SongListPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async goToGroupNavigation(groupName: any) {
    await this.page.getByTestId(`group-navigation-${groupName}`).click();
  }

  public getSongElement(songID: string) {
    return this.page.getByTestId(`song-${songID}`);
  }

  public async focusSong(songID: string) {
    await this.getSongElement(songID).click();
  }

  public async openPreviewForSong(songID: string) {
    await this.getSongElement(songID).dblclick();
  }

  public async navigateToSongWithKeyboard(songID: string) {
    await navigateWithKeyboard(this.page, `song-${songID}`);
  }

  public get songListElement() {
    return this.page.getByTestId('song-list-container');
  }

  public get searchInput() {
    return this.page.getByTestId('filters-search');
  }

  public get songPreviewElement() {
    return this.page.getByTestId('song-preview');
  }

  public expectSelectedSongToBe(songID: string) {
    return expect(this.songPreviewElement).toHaveAttribute('data-song', songID);
  }

  public expectSelectedSongNotToBe(songID: string) {
    return expect(this.songPreviewElement).not.toHaveAttribute('data-song', songID);
  }

  public get fullscreenElement() {
    return this.page.locator('[data-test="toggle-fullscreen"] svg');
  }

  public async expectFullscreenToBeOff() {
    await expect(this.fullscreenElement).toHaveAttribute('data-testid', 'FullscreenIcon');
  }

  public async expectFullscreenToBeOn() {
    await expect(this.fullscreenElement).toHaveAttribute('data-testid', 'FullscreenExitIcon');
  }

  public async expectGroupToBeInViewport(groupName: string) {
    await expect(this.page.locator(`[data-group-letter=${groupName}]`)).toBeInViewport();
  }

  public getPlaylistElement(name: string) {
    return this.page.getByTestId(`playlist-${name}`);
  }

  public async goToPlaylist(name: string) {
    await this.getPlaylistElement(name).click();
  }

  public get searchButton() {
    return this.page.getByTestId('search-song-button');
  }

  public get pickRandomButton() {
    return this.page.getByTestId('random-song-button');
  }

  public async expectPlaylistToBeSelected(name: string) {
    await expect(this.getPlaylistElement(name)).toHaveAttribute('data-selected', 'true');
  }

  public getDuetSongIcon(songID: string) {
    return this.getSongElement(songID).getByTestId('multitrack-indicator');
  }

  public async expectSongToBeMarkedAsPlayedToday(songID: string) {
    await expect(this.getSongElement(songID).getByTestId('song-stat-indicator')).toContainText('Played today', {
      ignoreCase: true,
    });
  }

  public async approveSelectedSongByKeyboard() {
    await this.page.keyboard.press('Enter');
  }
}
