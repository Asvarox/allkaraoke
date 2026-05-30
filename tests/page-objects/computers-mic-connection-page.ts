import { Browser, BrowserContext, Page } from '@playwright/test';

export class ComputersMicConnectionPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get micInputNameElement() {
    return this.page.getByTestId('selected-mic');
  }

  public async toggleMicInputName() {
    await this.micInputNameElement.click();
  }

  public get changeInputTypeButton() {
    return this.page.getByTestId('back-button');
  }

  public async goBackToInputSelection() {
    await this.changeInputTypeButton.click();
  }

  public get singSongButton() {
    return this.page.getByTestId('save-button');
  }

  public async goToMainMenu() {
    await this.singSongButton.click();
  }

  public async continueToTheSong() {
    await this.singSongButton.click();
  }
}
