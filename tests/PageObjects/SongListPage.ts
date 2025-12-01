import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { Toolbar } from '../components/Toolbar';
import { SongPreviewPagePO } from '../PageObjects/SongPreviewPage';

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

  public async isSongSelected(songID: string) {
    return this.page.locator(`[data-song="${songID}"][data-test="song-preview"]`).isVisible();
  }

  public async ensureSongToBeSelected(songID: string) {
    await expect(await this.getSongElement(songID)).toBeVisible();

    if (!(await this.isSongSelected(songID))) {
      await this.ensureSongIsScrolledTo(songID);
    }
    if (!(await this.isSongSelected(songID))) {
      const songElement = await this.getSongElement(songID, false);
      await songElement.click();
    }
    await this.expectSelectedSongToBe(songID);
  }

  public async openSongPreview(songID: string) {
    await this.ensureSongToBeSelected(songID);
    await this.songPreviewElement.click({ force: true });
    return new SongPreviewPagePO(this.page, this.context, this.browser);
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

  public async goBackToMainMenu() {
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('Backspace');
  }

  public get selectionPlaylistTip() {
    return this.page.getByRole('tooltip', {
      name: 'A combination of songs you might like and popular with other players.',
    });
  }

  public async closeSelectionPlaylistTip() {
    if (await this.selectionPlaylistTip.isVisible()) {
      await this.selectionPlaylistTip.getByTestId('close-tooltip-button').click();
    }
    await expect(this.selectionPlaylistTip).toBeHidden();
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

  public get emptyPlaylistAlert() {
    return this.songListContainer.getByText('No songs found');
  }

  public get remoteMicPlaylistTip() {
    return this.page.getByTestId('remote-mic-playlist-tip');
  }

  public get addMissingSongButton() {
    return this.page.getByTestId('add-new-song');
  }
}
