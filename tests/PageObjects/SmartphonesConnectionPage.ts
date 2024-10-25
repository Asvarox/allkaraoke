import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class SmartphonesConnectionPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get singSongButton() {
    return this.page.getByTestId('save-button');
  }

  public async goToMainMenu() {
    await this.singSongButton.click();
  }

  public async navigateToSaveButtonWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, 'save-button', remoteMic);
  }

  public getPlayerMicCheck(playerNumber: number) {
    return this.page.getByTestId(`mic-check-p${playerNumber}`);
  }

  public async expectPlayerNameToBe(playerNumber: number, playerName: string) {
    await expect(this.getPlayerMicCheck(playerNumber)).toContainText(playerName, { ignoreCase: true });
  }

  public async expectConnectedAlertToBeShownForPlayer(playerName: string) {
    await expect(this.page.locator('.Toastify')).toContainText(`${playerName} connected`, {
      ignoreCase: true,
    });
  }
}
