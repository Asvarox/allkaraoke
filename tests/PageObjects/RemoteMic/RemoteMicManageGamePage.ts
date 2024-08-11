import { expect } from '@playwright/experimental-ct-react';
import { Browser, BrowserContext, Page } from '@playwright/test';

export class RemoteMicManageGamePage {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get adjustGameLag() {
    return this.page.getByTestId('game-input-lag');
  }

  public async increaseGameInputLag() {
    await this.adjustGameLag.getByTestId('numeric-input-up').click();
  }

  public async expectGameInputLagToBe(value: string) {
    await expect(this.adjustGameLag.getByTestId('numeric-input-value')).toContainText(value);
  }

  public async goToManagePlayer(playerName: string) {
    await this.page.getByText(playerName).click();
  }

  public async goBackToMicSettings() {
    await this.page.getByTestId('close-modal').click();
  }
}
