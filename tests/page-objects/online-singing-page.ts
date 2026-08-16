import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class OnlineSingingPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get readinessElement() {
    return this.page.getByTestId('online-readiness');
  }

  public readinessRowElement(playerNumber: number) {
    return this.page.getByTestId(`online-readiness-${playerNumber}`);
  }

  public get readyButton() {
    return this.page.getByTestId('online-ready-button');
  }

  public async confirmReady() {
    await this.readyButton.click();
  }

  public get leaderboardElement() {
    return this.page.getByTestId('online-leaderboard');
  }

  public async expectLeaderboardToBeVisible(options?: { timeout?: number }) {
    await expect(this.leaderboardElement).toBeVisible(options);
  }
}
