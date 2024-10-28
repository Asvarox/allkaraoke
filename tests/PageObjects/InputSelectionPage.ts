import { Browser, BrowserContext, Page } from '@playwright/test';

export class InputSelectionPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public async selectSmartphones() {
    await this.page.getByTestId('remote-mics').click();
  }

  public async selectComputersMicrophone() {
    await this.page.getByTestId('built-in').click();
  }

  public async selectSingstarMicrophones() {
    await this.page.getByTestId('singstar-mics').click();
  }

  public get multipleMicButton() {
    return this.page.getByTestId('multiple-mics');
  }

  public async selectMultipleMicrophones() {
    await this.multipleMicButton.click();
  }

  public get advancedButton() {
    return this.page.getByTestId('advanced');
  }

  public async selectAdvancedSetup() {
    await this.advancedButton.click();
  }

  public get skipButton() {
    return this.page.getByTestId('skip');
  }

  public async skipToMainMenu() {
    await this.skipButton.click();
  }

  public async goBackToSongPreview() {
    await this.skipButton.click();
  }
}
