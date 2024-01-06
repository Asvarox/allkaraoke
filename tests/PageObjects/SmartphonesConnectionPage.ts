import { Browser, BrowserContext, Page } from '@playwright/test';

export class SmartphonesConnectionPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async saveAndGoToSing() {
    await this.page.getByTestId('save-button').click();
  }
}
