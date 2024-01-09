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

  public async waitForPlayersScoreToBeGreaterThan() {
    await expect(async () => {
      const p1score = await this.currentPlayersScore;

      expect(parseInt(p1score!, 10)).toBeGreaterThan(100);
    }).toPass({ timeout: 15_000 });
  }
}
