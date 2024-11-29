import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { Toolbar } from '../components/Toolbar';

export class SongListPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  toolbar = new Toolbar(this.page, this.context, this.browser);

  public async goToGroupNavigation(groupName: string) {
    await this.page.getByTestId(`group-navigation-${groupName}`).click();
  }

  private async ensureSongIsScrolledTo(songID: string) {
    if (await this.page.getByTestId(`song-${songID}`).isVisible()) return;

    try {
      return this.page.evaluate(
        async ([songID]) => {
          while (!window.__songList) {
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
          console.log(songID, window.__songList?.scrollToSong(songID));
        },
        [songID],
      );
    } catch (e) {
      console.log(e);
    }
  }

  public async getSongElement(songID: string, shouldEnsure = true) {
    if (shouldEnsure) await this.ensureSongIsScrolledTo(songID);
    return this.page.getByTestId(`song-${songID}`);
  }

  public get getSelectedSongID() {
    return this.songPreviewElement.getAttribute('data-song');
  }

  public async focusSong(songID: string) {
    const currentlyFocused = await this.songPreviewElement.getAttribute('data-song');
    if (currentlyFocused !== songID) {
      await this.ensureSongIsScrolledTo(songID);
      const song = await this.getSongElement(songID, false);
      await song.click();
    }
  }

  public async openPreviewForSong(songID: string) {
    const locator = await this.getSongElement(songID);
    await locator.click();
    await expect(this.songPreviewElement).toHaveAttribute('data-song', songID);
    await locator.click({ force: true });
  }

  public get songListContainer() {
    return this.page.locator('[data-test="song-list-container"]');
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

  public async expectGroupToBeInViewport(groupName: string) {
    await expect(this.page.locator(`[data-group-name=${groupName}]`)).toBeInViewport();
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

  public get searchInput() {
    return this.page.getByTestId('filters-search');
  }

  public async searchSong(songID: string) {
    await this.searchButton.click();
    await expect(this.searchInput).toBeVisible();
    await this.page.keyboard.type(songID);
  }

  public get pickRandomButton() {
    return this.page.getByTestId('random-song-button');
  }

  public async expectPlaylistToBeSelected(name: string) {
    await expect(this.getPlaylistElement(name)).toHaveAttribute('data-selected', 'true');
  }

  public async getDuetSongIcon(songID: string) {
    return (await this.getSongElement(songID)).getByTestId('multitrack-indicator');
  }

  public async expectSongToBeMarkedWithLanguageFlagIcon(songID: string, isoCode: string) {
    await this.ensureSongIsScrolledTo(songID);
    const song = await this.getSongElement(songID, false);
    await expect(song.locator('img')).toHaveAttribute('data-isocode', isoCode);
  }

  public async expectSongToBeMarkedAsPlayedToday(songID: string) {
    await this.ensureSongIsScrolledTo(songID);
    const song = await this.getSongElement(songID, false);
    await expect(song.getByTestId('song-stat-indicator')).toContainText('Played today', {
      ignoreCase: true,
    });
  }

  public async approveSelectedSongByKeyboard() {
    await this.page.keyboard.press('Enter');
  }

  public async expectSongToBeVisibleAsNew(songID: string) {
    await this.ensureSongIsScrolledTo(`${songID}-new-group`);
    const song = await this.getSongElement(`${songID}-new-group`, false);
    await expect(song).toBeVisible();
  }

  public async goBackToMainMenu() {
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('Backspace');
  }

  public get selectionPlaylistTip() {
    return this.page.getByRole('tooltip');
  }

  public async closeTheSelectionPlaylistTip() {
    await this.page.getByTestId('close-tooltip-button').click();
  }

  public get popularityIcon() {
    return this.page.locator('[data-testid="StarIcon"]');
  }

  public async expectPlaylistContainSongsMarkedAsPopular() {
    const popSongs = this.songListContainer.locator(this.popularityIcon).last();
    await expect(popSongs).toBeVisible();
    await popSongs.click();
  }

  public async expectSongToBeMarkedAsNewInNewGroup(songID: string) {
    await expect(await this.getSongElement(`${songID}-new-group`)).toBeVisible();
  }

  public async expectPlaylistContainSongsMarkedAsNew() {
    const newSongs = this.songListContainer.locator('[data-testid="FiberNewOutlinedIcon"]').first();
    await expect(newSongs).toBeVisible();
    await newSongs.click();
  }
}
