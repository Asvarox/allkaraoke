import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class SongPreviewPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public get nextButton() {
    return this.page.getByTestId('next-step-button');
  }

  public async goNext() {
    await this.nextButton.click();
  }

  public async navigateToGoNextByKeyboard() {
    await navigateWithKeyboard(this.page, 'next-step-button');
    await this.page.keyboard.press('Enter', { delay: 40 });
  }

  public async playTheSong() {
    await this.page.getByTestId('play-song-button').click();
  }

  public async navigateToPlayTheSongByKeyboard() {
    await navigateWithKeyboard(this.page, 'play-song-button');
    await this.page.keyboard.press('Enter');
  }

  public get gameModeSettingsElement() {
    return this.page.getByTestId('game-mode-setting');
  }

  public async navigateToGameModeSettingsByKeyboard() {
    await navigateWithKeyboard(this.page, 'game-mode-setting');
  }

  public async expectGameModeToBe(modeName: string) {
    await expect(this.gameModeSettingsElement).toHaveAttribute('data-test-value', `${modeName}`);
  }

  public get difficultySettingsElement() {
    return this.page.getByTestId('difficulty-setting');
  }

  public async navigateToDifficultySettingsByKeyboard() {
    await navigateWithKeyboard(this.page, 'difficulty-setting');
  }

  public async expectGameDifficultyLevelToBe(level: string) {
    await expect(this.difficultySettingsElement).toHaveAttribute('data-test-value', `${level}`);
  }

  public getPlayerNameInput(playerNumber: number) {
    return this.page.getByTestId(`player-${playerNumber}-name`);
  }

  public async navigateToChangePlayerNameByKeyboard(playerNumber: number) {
    await navigateWithKeyboard(this.page, `player-${playerNumber}-name`);
    await this.page.keyboard.press('Enter', { delay: 40 });
  }

  public async enterPlayerNameByKeyboard(playerName: string) {
    await this.page.keyboard.type(playerName);
    await this.page.keyboard.press('Enter');
  }

  public async navigateAndEnterPlayerNameByKeyboard(playerNumber: number, playerName: string) {
    await this.navigateToChangePlayerNameByKeyboard(playerNumber);
    await this.enterPlayerNameByKeyboard(playerName);
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

  public async navigateAndTogglePlayerTrackSettingsByKeyboard(playerNumber: number) {
    await navigateWithKeyboard(this.page, `player-${playerNumber}-track-setting`);
    await this.page.keyboard.press('Enter');
  }

  public async expectPlayerTrackNumberToBe(playerNumber: number, trackNumber: number) {
    await expect(this.getPlayerTrackSettings(playerNumber)).toHaveAttribute('data-test-value', `${trackNumber}`);
  }

  public async setupMics() {
    await this.page.getByTestId('select-inputs-button').click();
  }
}
