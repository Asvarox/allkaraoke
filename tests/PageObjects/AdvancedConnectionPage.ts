import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class AdvancedConnectionPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get saveButton() {
    return this.page.getByTestId('save-button');
  }

  public async goToMainMenu() {
    await this.saveButton.click();
  }

  public async goToSongPreview() {
    await this.saveButton.click();
  }

  public get changeInputTypeButton() {
    return this.page.getByTestId('back-button');
  }

  public async goBackToInputSelection() {
    await this.changeInputTypeButton.click();
  }

  public getPlayerMicSource(playerNumber: number) {
    return this.page.getByTestId(`player-${playerNumber}-source`);
  }

  public async expectPlayerMicSourceToBe(playerNumber: number, name: string) {
    await expect(this.getPlayerMicSource(playerNumber)).toContainText(name, { ignoreCase: true });
  }

  public async togglePlayerMicrophoneSource(playerNumber: number) {
    await this.getPlayerMicSource(playerNumber).click();
  }

  public getMicInputName(playerNumber: number) {
    return this.page.getByTestId(`player-${playerNumber}-input`);
  }

  public async expectMicInputNameToBe(playerNumber: number, name: string) {
    await expect(this.getMicInputName(playerNumber)).toContainText(name, { ignoreCase: true });
  }

  public async toggleMicInputName(playerNumber: number) {
    await this.getMicInputName(playerNumber).click();
  }

  public getPlayerNameInput(playerNumber: number) {
    // in Advanced mode, if player is using remote mic/smartphone, input is visible as player's name
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
}
