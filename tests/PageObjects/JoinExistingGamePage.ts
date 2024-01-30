import { Browser, BrowserContext, Page } from '@playwright/test';

export class JoinExistingGamePagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async confirmWifiConnection() {
    await this.page.getByTestId('confirm-wifi-connection').click();
  }

  public get gameCodeInput() {
    return this.page.getByTestId('game-code-input');
  }

  public get playerNameInput() {
    return this.page.getByTestId('player-name-input');
  }

  public get connectButton() {
    return this.page.getByTestId('connect-button');
  }

  public async connectWithGame() {
    await this.connectButton.click();
  }
}
