import { Browser, BrowserContext, Page } from '@playwright/test';

export class SingstarConnectionPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public get detectionAdvancedTip() {
    return this.page.getByTestId('advanced-tip');
  }

  public get availableMicsListChangeInfo() {
    return this.page.getByTestId('list-change-info');
  }

  public get setupConnectedAlert() {
    return this.page.getByTestId('setup-completed');
  }

  public get setupNotConnectedAlert() {
    return this.page.getByTestId('setup-not-completed');
  }
}
