import { Browser, BrowserContext, Page, expect } from '@playwright/test';

export class GamePagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async skipIntro() {
    await this.page.waitForTimeout(1500);
    await expect(this.page.getByTestId('skip-intro-info')).toBeVisible();
    await this.page.waitForTimeout(1500);
    await this.page.keyboard.press('Enter');
  }
}
