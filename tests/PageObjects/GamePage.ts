import { Browser, BrowserContext, Page, expect } from '@playwright/test';

export class GamePagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async skipIntro() {
    await this.page.waitForTimeout(1500);
    await expect(this.page.getByTestId('skip-intro-info')).toBeVisible();
    await this.page.waitForTimeout(1500);
    await this.page.keyboard.press('Enter');
  }

  public async restartSong() {
    await this.page.getByTestId('button-restart-song').click();
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

  public async expectPlayersScoreToBe() {
    await expect(this.playersScoreElement).toHaveAttribute('data-score', '0', { timeout: 15_000 });
  }
}
