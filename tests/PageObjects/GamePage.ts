import { Browser, BrowserContext, Page, expect } from '@playwright/test';

export class GamePagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async skipIntro() {
    await this.page.waitForTimeout(1500);
    await expect(this.page.getByTestId('skip-intro-info')).toBeVisible();
    await this.page.waitForTimeout(1500);
    await this.page.keyboard.press('Enter');
  }

  public async goToPauseMenu() {
    await this.page.locator('body').click({ force: true, position: { x: 350, y: 350 } });
  }

  public async goToRestartSong() {
    await this.page.getByTestId('button-restart-song').click();
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

  public get playersScoreElement() {
    return this.page.getByTestId('players-score');
  }

  public get currentPlayersScore() {
    return this.playersScoreElement.getAttribute('data-score');
  }

  public async waitForPlayersScoreToBeGreaterThan(expected: number) {
    await expect(async () => {
      const p1score = await this.currentPlayersScore;

      expect(parseInt(p1score!, 10)).toBeGreaterThan(expected);
    }).toPass({ timeout: 15_000 });
  }

  public async expectPlayersScoreToBe(expected: number) {
    await expect(this.playersScoreElement).toHaveAttribute('data-score', `${expected}`, { timeout: 15_000 });
  }
}
