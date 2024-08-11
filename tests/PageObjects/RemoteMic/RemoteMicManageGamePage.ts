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

  public async increaseMicInputDelay() {
    await this.adjustGameLag.getByTestId('numeric-input-up').click();
  }

  public async expectMicInputDelayToBe(value: string) {
    await expect(this.adjustGameLag.getByTestId('numeric-input-value')).toContainText(value);
  }

  public async goToManagePlayer(playerNumber: string) {
    await this.page.getByText(`Player ${playerNumber}`).click();
  }

  public async goBackToMicSettings() {
    await this.page.getByTestId('close-modal').click();
  }
}
