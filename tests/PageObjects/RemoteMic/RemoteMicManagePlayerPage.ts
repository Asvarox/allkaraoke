import { Browser, BrowserContext, Page } from '@playwright/test';

export class RemoteMicManagePlayerPage {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public async setMicAssigment(micColor: string) {
    if (micColor === 'blue') {
      await this.page.getByTestId(`change-to-player-0`).click();
    } else if (micColor === 'red') {
      await this.page.getByTestId(`change-to-player-1`).click();
    } else if (micColor === 'green') {
      await this.page.getByTestId(`change-to-player-2`).click();
    } else if (micColor === 'yellow') {
      await this.page.getByTestId(`change-to-player-3`).click();
    }
  }

  public async unassignManagedPlayer() {
    await this.page.getByTestId('change-to-unset').click();
  }
}
