import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class AdvancedConnectionPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async saveAndGoToSing() {
    await this.page.getByTestId('save-button').click();
  }

  public getPlayerNameInput(playerNumber: number) {
    return this.page.getByTestId(`player-${playerNumber}-input`);
  }

  public async expectPlayerNameToBe(playerNumber: number, playerName: string) {
    await expect(this.getPlayerNameInput(playerNumber)).toContainText(playerName, { ignoreCase: true });
  }

  public async expectConnectedAlertToBeShownForPlayer(playerName: string) {
    await expect(this.page.locator('.Toastify')).toContainText(`${playerName} connected`, {
      ignoreCase: true,
    });
  }

  public async togglePlayerMicrophoneSource(playerNumber: number) {
    await this.page.getByTestId(`player-${playerNumber}-source`).click();
  }
}
