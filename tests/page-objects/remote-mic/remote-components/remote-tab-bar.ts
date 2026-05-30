import { Browser, BrowserContext, Page } from '@playwright/test';

export class RemoteTabBar {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public async goToMicMainPage() {
    await this.page.getByTestId('menu-microphone').click();
  }

  public async goToSongList() {
    await this.page.getByTestId('menu-song-list').click();
  }

  public async goToSettings() {
    await this.page.getByTestId('menu-settings').click();
  }
}
