import { Browser, BrowserContext, Page } from '@playwright/test';

export class MainMenuPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async goToSingSong() {
    await this.page.getByTestId('sing-a-song').click();
  }

  public async goToManageSongs() {
    await this.page.getByTestId('manage-songs').click();
  }
}
