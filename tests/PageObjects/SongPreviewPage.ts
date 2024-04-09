import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class SongPreviewPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get nextButton() {
    return this.page.getByTestId('next-step-button');
  }

  public async goNext() {
    await this.nextButton.click();
  }

  public async navigateToGoNextWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, 'next-step-button', remoteMic);
    await this.page.keyboard.press('Enter', { delay: 40 });
  }

  public async playTheSong() {
    await this.page.getByTestId('play-song-button').click();
    await this.page.getByTestId('make-song-go-fast').click();
  }

  public async navigateToPlayTheSongWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, 'play-song-button', remoteMic);
    await this.page.keyboard.press('Enter');
  }

  public get gameModeSettingsElement() {
    return this.page.getByTestId('game-mode-setting');
  }

  public async toggleGameMode() {
    await this.gameModeSettingsElement.click();
  }

  public async navigateToGameModeSettingsWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, 'game-mode-setting', remoteMic);
  }

  public async expectGameModeToBe(modeName: string) {
    await expect(this.gameModeSettingsElement).toHaveAttribute('data-test-value', `${modeName}`);
  }

  public get difficultySettingsElement() {
    return this.page.getByTestId('difficulty-setting');
  }

  public async navigateToDifficultySettingsWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, 'difficulty-setting', remoteMic);
  }

  public async expectGameDifficultyLevelToBe(level: string) {
    await expect(this.difficultySettingsElement).toHaveAttribute('data-test-value', `${level}`);
  }

  public getPlayerNameInput(playerNumber: number) {
    return this.page.getByTestId(`player-${playerNumber}-name`);
  }

  public async navigateToChangePlayerNameWithKeyboard(playerNumber: number, remoteMic?: Page) {
    await navigateWithKeyboard(this.page, `player-${playerNumber}-name`, remoteMic);
    await this.page.keyboard.press('Enter', { delay: 40 });
  }

  public async enterPlayerNameWithKeyboard(playerName: string) {
    await this.page.keyboard.type(playerName);
    await this.page.keyboard.press('Enter');
  }

  public async navigateAndEnterPlayerNameWithKeyboard(playerNumber: number, playerName: string) {
    await this.navigateToChangePlayerNameWithKeyboard(playerNumber);
    await this.enterPlayerNameWithKeyboard(playerName);
  }

  public async expectEnteredPlayerNameToBe(playerNumber: number, playerName: string) {
    await expect(this.getPlayerNameInput(playerNumber)).toHaveAttribute('value', `${playerName}`);
  }

  public async expectEnteredPlayerNameToBePrefilledWith(playerNumber: number, playerName: string) {
    await expect(this.getPlayerNameInput(playerNumber)).toHaveAttribute('placeholder', `${playerName}`);
  }

  public async expectRecentPlayerListToContainName(name: string) {
    await this.getPlayerNameInput(0).click();
    await expect(this.page.locator('role=listbox')).toContainText(`${name}`);
    await this.page.keyboard.press('Enter');
  }

  public getPlayerTrackSettings(playerNumber: number) {
    return this.page.getByTestId(`player-${playerNumber}-track-setting`);
  }

  public async navigateAndTogglePlayerTrackSettingsWithKeyboard(playerNumber: number, remoteMic?: Page) {
    await navigateWithKeyboard(this.page, `player-${playerNumber}-track-setting`, remoteMic);
    await this.page.keyboard.press('Enter');
  }

  public async expectPlayerTrackNumberToBe(playerNumber: number, trackNumber: number) {
    await expect(this.getPlayerTrackSettings(playerNumber)).toHaveAttribute('data-test-value', `${trackNumber}`);
  }

  public async goToInputSelection() {
    await this.page.getByTestId('select-inputs-button').click();
  }

  public getUnavailableStatusPlayer(playerNumber: number) {
    return this.page.getByTestId(`indicator-player-${playerNumber}`).getByTestId('status-unavailable');
  }

  public async expectConnectedAlertToBeShownForPlayer(playerName: string) {
    await expect(this.page.locator('.Toastify')).toContainText(`${playerName} connected`, {
      ignoreCase: true,
    });
  }

  public async expectPlayerConfirmationStatusToBe(playerName: string) {
    await expect(this.page.locator(`[data-test="player-confirm-status"][data-name="${playerName}"]`)).toHaveAttribute(
      'data-confirmed',
      'true',
    );
  }
}
