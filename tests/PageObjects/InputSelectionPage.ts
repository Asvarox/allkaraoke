import { Browser, BrowserContext, Page } from '@playwright/test';

export class InputSelectionPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async selectSmartphones() {
    await this.page.getByTestId('remote-mics').click();
  }

  public async selectComputersMicrophone() {
    await this.page.getByTestId('built-in').click();
  }

  public async selectSingstarMicrophones() {
    await this.page.getByTestId('mics').click();
  }

  public async selectAdvancedSetup() {
    await this.page.getByTestId('advanced').click();
  }

  public async skipToMainMenu() {
    await this.page.getByTestId('skip').click();
  }
}
