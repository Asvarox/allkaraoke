import { Browser, BrowserContext, Page, expect } from '@playwright/test';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class GamePagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public get skipIntroElement() {
    return this.page.getByTestId('skip-intro-info');
  }

  public async skipIntro() {
    await this.page.waitForTimeout(1500);
    await expect(this.skipIntroElement).toBeVisible();
    await this.page.waitForTimeout(1500);
    await this.page.keyboard.press('Enter');
  }

  public async goToPauseMenu() {
    await this.page.locator('body').click({ force: true, position: { x: 350, y: 350 } });
  }

  public get restartButton() {
    return this.page.getByTestId('button-restart-song');
  }

  public async goToRestartSong() {
    await this.restartButton.click();
  }

  public async navigateToRestartSongWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, 'button-restart-song', remoteMic);
  }

  public get resumeSongButton() {
    return this.page.getByTestId('button-resume-song');
  }

  public async gotoResumeSong() {
    await this.resumeSongButton.click();
  }

  public async goToExitSong() {
    await this.page.getByTestId('button-exit-song').click();
  }

  public async microphonesSettings() {
    await this.page.getByTestId('input-settings').click();
  }

  public getPlayerScoreElement(playerNumber: number) {
    return this.page.getByTestId(`player-${playerNumber}-score`);
  }

  public get playersCoopScoreElement() {
    return this.page.getByTestId('players-score');
  }

  public get currentPlayersScore() {
    return this.playersCoopScoreElement.getAttribute('data-score');
  }

  public async waitForPlayersScoreToBeGreaterThan(expected: number) {
    await expect(async () => {
      const p1score = await this.currentPlayersScore;

      expect(parseInt(p1score!, 10)).toBeGreaterThan(expected);
    }).toPass({ timeout: 15_000 });
  }

  public async expectPlayersScoreToBe(expected: number) {
    await expect(this.playersCoopScoreElement).toHaveAttribute('data-score', `${expected}`, { timeout: 15_000 });
  }

  public getSongLyricsForPlayerElement(playerNumber: number) {
    return this.page.getByTestId(`lyrics-current-player-${playerNumber}`);
  }
}
