import { expect } from '@playwright/experimental-ct-react';
import { Browser, BrowserContext, Page } from '@playwright/test';

export class RemoteMicSettingsPage {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public async goToMicSettings() {
    await this.page.getByTestId('microphone-settings').click();
  }

  public get manageGameButton() {
    return this.page.getByTestId('manage-game');
  }

  public async goToManageGame() {
    await this.manageGameButton.click();
  }

  public async goToMicMainPage() {
    await this.page.getByTestId('menu-microphone').click();
  }

  public async resetMicrophone() {
    await this.page.getByTestId('reset-microphone').click();
  }

  public get remoteMicID() {
    return this.page.getByTestId('remote-mic-id');
  }

  public get adjustMicLag() {
    return this.page.getByTestId('microphone-delay');
  }

  public async increaseMicInputLag() {
    await this.adjustMicLag.getByTestId('numeric-input-up').click();
  }

  public async expectMicInputLagToBe(value: string) {
    await expect(this.adjustMicLag.getByTestId('numeric-input-value')).toContainText(value);
  }
}
