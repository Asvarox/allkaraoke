import { Browser, BrowserContext, Page } from '@playwright/test';

export class RemoteMicManagePlayerPage {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public async setMicAssigment(micColor: 'blue' | 'red' | 'green' | 'yellow') {
    const colorToNumberMap = {
      blue: '0',
      red: '1',
      green: '2',
      yellow: '3',
    };

    await this.page.getByTestId(`change-to-player-${colorToNumberMap[micColor]}`).click();
  }

  public async unassignManagedPlayer() {
    await this.page.getByTestId('change-to-unset').click();
  }

  public async removePlayer() {
    await this.page.getByTestId('remove-player').click();
  }
}
