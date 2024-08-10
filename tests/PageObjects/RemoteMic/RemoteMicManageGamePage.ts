import { Browser, BrowserContext, Page } from '@playwright/test';

export class RemoteMicManageGamePage {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public async goToManagePlayer(playerNumber: string) {
    await this.page.getByText(`Player ${playerNumber}`).click();
  }

  public async goBackToMicSettings() {
    await this.page.getByTestId('close-modal').click();
  }
}
