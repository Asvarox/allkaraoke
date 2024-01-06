import { Browser, BrowserContext, Page } from '@playwright/test';

export class PostGamePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async skipScoresAnimation() {
    await this.page.getByTestId('skip-animation-button').click({ timeout: 20_000 });
  }
}
