import { Browser, BrowserContext, expect, Page } from '@playwright/test';

import { SongGroupsNavigation } from '../components/song-groups-navigation';
import { Toolbar } from '../components/toolbar';

export class SongListPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  toolbar = new Toolbar(this.page, this.context, this.browser);
  songGroups = new SongGroupsNavigation(this.page, this.context, this.browser);

  public async goToGroupNavigation(groupName: string) {
    await this.songGroups.goToGroup(groupName);
  }

  private async ensureSongIsScrolledTo(songID: string) {
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (await this.page.getByTestId(`song-${songID}`).isVisible()) return;

      try {
        await this.page.evaluate(
          async ([songID]) => {
            while (!window.__songList) {
              await new Promise((resolve) => setTimeout(resolve, 20));
            }
            console.log(songID, window.__songList?.scrollToSong(songID));
          },
          [songID],
        );

        // Give some time for the scroll to complete
        await this.page.waitForTimeout(150);
      } catch (e) {
        console.log(e);
      }
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
    await this.ensureSongIsScrolledTo(songID);
    const song = await this.getSongElement(songID, false);
    await expect(async () => {
      if ((await this.songPreviewElement.getAttribute('data-song')) !== songID) {
        // Dispatched straight to the card - a real click can land on the overlay of the currently
        // previewed (bigger, overlapping) song and expand that one instead
        await song.dispatchEvent('click');
      }
      await expect(this.songPreviewElement).toHaveAttribute('data-song', songID, { timeout: 1000 });
    }).toPass({ timeout: 10_000 });
  }

  public async openPreviewForSong(songID: string) {
    const gameModeSetting = this.page.getByTestId('game-mode-setting');
    const isExpandedOnSong = async () =>
      (await gameModeSetting.isVisible()) && (await this.songPreviewElement.getAttribute('data-song')) === songID;

    // Already expanded on this song (e.g. focusSong triggered expansion)
    if (await isExpandedOnSong()) return;
    await this.focusSong(songID);
    const song = await this.getSongElement(songID, false);
    // Clicking the focused card expands it (with instant song preview, focusing alone already does).
    // Not Enter - after a search, keyboard focus stays in the search input
    await expect(async () => {
      if (!(await gameModeSetting.isVisible())) await song.dispatchEvent('click');
      await expect(gameModeSetting).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await this.expectSelectedSongToBe(songID);
  }

  public getUnverifiedSongSearchResult(songTitle: string) {
    return this.page.getByRole('button', { name: songTitle, exact: true });
  }

  public get unverifiedSongsGroup() {
    return this.page.locator('[data-group-name="Unverified songs"]');
  }

  public getUnverifiedSongCardById(unverifiedSongId: string) {
    return this.page.getByTestId(`song-${unverifiedSongId}`);
  }

  public async expectUnverifiedSongsGroupToBeVisible() {
    await expect(this.unverifiedSongsGroup).toBeVisible();
  }

  public async expectUnverifiedSongCardToBeVisible(unverifiedSongId: string) {
    await expect(this.getUnverifiedSongCardById(unverifiedSongId)).toBeVisible();
  }

  public async openUnverifiedSongSearchResultCard(unverifiedSongId: string) {
    const unverifiedSongCard = this.getUnverifiedSongCardById(unverifiedSongId);

    await expect(unverifiedSongCard).toBeVisible();
    await unverifiedSongCard.click();
    await this.page.waitForTimeout(100);

    if (!(await this.page.getByTestId('game-mode-setting').isVisible())) {
      await this.page.keyboard.press('Enter');
    }

    await expect(this.page.getByTestId('game-mode-setting')).toBeVisible();
  }

  public get songListContainer() {
    return this.page.locator('[data-test="song-list-container"]');
  }

  /**
   * Scrolls the list back to the top by wheeling over it, which — unlike the group nav row — moves
   * the list without moving the selection. A wheel rather than a `scrollTo`: the element that
   * actually scrolls is an inner node of the virtualization, not `song-list-container` itself.
   */
  public async scrollSongListToTop() {
    const listBox = await this.songListContainer.boundingBox();
    if (!listBox) throw new Error('Song list is not visible');

    await this.page.mouse.move(listBox.x + listBox.width / 2, listBox.y + listBox.height / 2);
    await this.page.mouse.wheel(0, -20_000);
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
    await this.page.waitForTimeout(200); // Wait for the playlist to load and the first song to be rendered
  }

  public get searchButton() {
    return this.page.getByTestId('search-song-button');
  }

  public get searchInput() {
    // In v2 song selection the search input always stays visible; it uses 'search-input' test ID.
    return this.page.getByTestId('search-input');
  }

  public async searchSong(songTitle: string) {
    // In v2 the search input is always visible. Typing triggers a hotkey that populates the search filter.
    await this.page.keyboard.type(songTitle);
    await expect(this.searchInput).toBeVisible();
  }

  public get pickRandomButton() {
    return this.page.getByTestId('random-song-button');
  }

  public async expectPlaylistToBeSelected(name: string) {
    // In v2, the selected playlist button receives data-focused="true" (via the Button component's focused prop).
    await expect(this.getPlaylistElement(name)).toHaveAttribute('data-focused', 'true');
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
    // In v2, the first Backspace enters toolbar focus mode; the second navigates to the main menu.
    await this.page.keyboard.press('Backspace');
    await this.page.waitForTimeout(200);
    await this.page.keyboard.press('Backspace');
  }

  public getLanguagePickerEntry(language: string) {
    return this.page.getByTestId(`language-picker-${language}`);
  }

  public async selectLanguageFromPicker(language: string) {
    await expect(this.getLanguagePickerEntry(language)).toBeVisible();
    await this.getLanguagePickerEntry(language).click();
  }

  public get selectionPlaylistTip() {
    return this.page.getByRole('tooltip');
  }

  public async closeTheSelectionPlaylistTip() {
    // In v2 the Selection playlist tooltip (ClosableTooltip Wrapper) is never rendered in the Toolbar,
    // so this is a no-op. If the tooltip exists (v1 behaviour) it will be closed.
    const button = this.page.getByTestId('close-tooltip-button');
    if (await button.isVisible()) {
      await button.click();
    }
  }

  public get popularityIcon() {
    // In v1 (non-compact), popular English songs show StarIcon.
    // In v2 (compact song list), popular English songs show a chip with data-test="popular-chip".
    return this.songListContainer.locator('[data-testid="StarIcon"], [data-test="popular-chip"]');
  }

  public async expectPlaylistContainSongsMarkedAsPopular() {
    const popSong = this.popularityIcon.last();
    await expect(popSong).toBeVisible();
    await popSong.click();
  }

  public async expectSongToBeMarkedAsNewInNewGroup(songID: string) {
    await expect(await this.getSongElement(`${songID}-new-group`)).toBeVisible();
  }

  public async expectPlaylistContainSongsMarkedAsNew() {
    // In v1 (non-compact), recently-updated songs show FiberNewOutlinedIcon.
    // In v2 (compact song list), recently-updated songs show a chip with data-test="new-chip".
    const newSong = this.songListContainer
      .locator('[data-testid="FiberNewOutlinedIcon"], [data-test="new-chip"]')
      .first();
    await expect(newSong).toBeVisible();
    await newSong.click();
  }

  public get emptyPlaylistAlert() {
    return this.songListContainer.getByText('No songs found');
  }

  public get remoteMicPlaylistTip() {
    return this.page.getByTestId('remote-mic-playlist-tip');
  }
}
