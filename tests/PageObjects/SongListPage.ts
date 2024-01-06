import { Browser, BrowserContext, Page } from '@playwright/test';

export class SongListPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async goToGroupNavigation(groupName: any) {
    await this.page.getByTestId(`group-navigation-${groupName}`).click();
  }
}
