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

  public async goToManageGame() {
    await this.page.getByTestId('manage-game').click();
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
}
