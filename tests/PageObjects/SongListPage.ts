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
    const currentlyFocused = await this.songPreviewElement.getAttribute('data-song');
    if (currentlyFocused !== songID) {
      await this.ensureSongIsScrolledTo(songID);
      const song = await this.getSongElement(songID, false);
      // force:true bypasses the song-preview overlay when showVideo=true intercepts pointer events.
      await song.click({ force: true });
    }
  }

  public async openPreviewForSong(songID: string) {
    // If the game settings are already visible (e.g. focusSong triggered expansion), skip clicking.
    if (await this.page.getByTestId('game-mode-setting').isVisible()) return;
    await this.ensureSongIsScrolledTo(songID);
    const song = await this.getSongElement(songID, false);
    // force:true bypasses Playwright's "element intercepts pointer events" check when the
    // song-preview overlay is visible (showVideo=true). The click triggers expansion directly
    // or focuses the song so Enter can expand it.
    await song.click({ force: true });
    // Wait briefly for any React state update from the click, then check if settings are visible.
    await this.page.waitForTimeout(100);
    // If the preview isn't expanded yet (e.g. the song wasn't focused before the click),
    // press Enter via keyboard navigation to expand it.
    if (!(await this.page.getByTestId('game-mode-setting').isVisible())) {
      await this.page.keyboard.press('Enter');
    }
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
