import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class SmartphonesConnectionPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async saveAndGoToSing() {
    await this.page.getByTestId('save-button').click();
  }

  public getPlayerMicCheck(playerNumber: number) {
    return this.page.getByTestId(`mic-check-p${playerNumber}`);
  }

  public async expectPlayerNameToBe(playerNumber: number, playerName: string) {
    await expect(this.getPlayerMicCheck(playerNumber)).toContainText(playerName, { ignoreCase: true });
  }
}
