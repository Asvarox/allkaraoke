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

  public async goBackToInputSelectionPage() {
    await this.changeInputTypeButton.click();
  }

  public get saveButton() {
    return this.page.getByTestId('save-button');
  }

  public async goToMainMenuPage() {
    await this.saveButton.click();
  }

  public async continueToTheSong() {
    await this.saveButton.click();
  }
}
