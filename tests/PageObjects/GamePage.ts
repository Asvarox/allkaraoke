import { Browser, BrowserContext, Page, expect } from '@playwright/test';
import { PauseMenuPagePO, settingsActionType, songActionType } from '../PageObjects/PauseMenuPage';

export class GamePagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  pauseMenu = new PauseMenuPagePO(this.page, this.context, this.browser);

  private skipIntroSelector = 'skip-intro-info';

  public get skipIntroElement() {
    return this.page.getByTestId(this.skipIntroSelector);
  }

  public async skipIntroIfPossible() {
    try {
      const skipIntroEl = await this.page.waitForSelector(`[data-test=${this.skipIntroSelector}`, { timeout: 5_000 });

      if (skipIntroEl) {
        await this.page.keyboard.press('Enter');
      }
    } catch (error) {
      console.log('Skip-intro-info is not visible', error);
    }
  }

  public async openPauseMenuByClick() {
    await this.page.locator('body').click({ force: true, position: { x: 350, y: 350 } });
    await expect(this.pauseMenu.menuContainer).toBeVisible();
  }

  public async openPauseMenuByKeyboard() {
    await this.page.keyboard.press('Backspace');
    await expect(this.pauseMenu.menuContainer).toBeVisible();
  }

  private async openPauseMenuAndSelectAction(actionName: songActionType | settingsActionType) {
    await this.openPauseMenuByKeyboard();
    await this.pauseMenu.selectAction(actionName);
  }

  public async openPauseMenuAndResumeSong() {
    await this.openPauseMenuAndSelectAction('resume');
  }

  public async openPauseMenuAndRestartSong() {
    await this.openPauseMenuAndSelectAction('restart');
  }

  public async openPauseMenuAndExitSong() {
    await this.openPauseMenuAndSelectAction('exit');
  }

  private async openPauseMenuAndSelectActionWithKeyboard(
    actionName: songActionType | settingsActionType,
    remoteMic?: Page,
  ) {
    await this.openPauseMenuByKeyboard();
    await this.pauseMenu.confirmActionWithKeyboard(actionName, remoteMic);
  }

  public async openPauseMenuAndResumeSongWithKeyboard(remoteMic?: Page) {
    await this.openPauseMenuAndSelectActionWithKeyboard('resume', remoteMic);
  }

  public async openPauseMenuAndRestartSongWithKeyboard(remoteMic?: Page) {
    await this.openPauseMenuAndSelectActionWithKeyboard('restart', remoteMic);
  }

  public async openPauseMenuAndExitSongWithKeyboard(remoteMic?: Page) {
    await this.openPauseMenuAndSelectActionWithKeyboard('exit', remoteMic);
  }

  public async openPauseMenuAndSelectMicSettingsWithKeyboard(remoteMic?: Page) {
    await this.openPauseMenuAndSelectActionWithKeyboard('mic settings', remoteMic);
  }

  public getPlayerScoreElement(playerNumber: number) {
    return this.page.getByTestId(`player-${playerNumber}-score`);
  }

  public async getCurrentPlayerScore(playerNumber: number) {
    return this.getPlayerScoreElement(playerNumber).getAttribute('data-score');
  }

  public async expectPlayerScoreValueToBe(playerNumber: number, expectedScore: string) {
    await expect(this.getPlayerScoreElement(playerNumber)).toHaveAttribute('data-score', expectedScore);
  }

  public get playersCoopScoreElement() {
    return this.page.getByTestId('players-score');
  }

  public get currentPlayersCoopScore() {
    return this.playersCoopScoreElement.getAttribute('data-score');
  }

  public async waitForPlayersScoreToBeGreaterThan(expected: number) {
    await expect(async () => {
      const p1score = await this.currentPlayersCoopScore;

      expect(parseInt(p1score!, 10)).toBeGreaterThan(expected);
    }).toPass({ timeout: 15_000 });
  }

  public async expectPlayersCoopScoreValueToBe(expected: number) {
    await expect(this.playersCoopScoreElement).toHaveAttribute('data-score', `${expected}`, { timeout: 15_000 });
  }

  public getSongLyricsForPlayerElement(playerNumber: number) {
    return this.page.getByTestId(`lyrics-container-player-${playerNumber}`);
  }

  public get songArtistAndTitleContainer() {
    return this.page.getByTestId('background-container');
  }

  public async expectArtistAndSongTitleToBeShown(artist: string, title: string) {
    await expect(this.songArtistAndTitleContainer).toBeVisible();
    await expect(this.page.getByTestId('song-artist')).toHaveText(artist);
    await expect(this.page.getByTestId('song-title')).toHaveText(title);
  }

  public get changeIndicatorIcon() {
    return this.page.getByTestId('SwapHorizIcon');
  }

  public get passTheMicProgressElement() {
    return this.page.getByTestId('pass-the-mic-progress');
  }
}
