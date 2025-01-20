import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { Calibration } from '../components/Calibration';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class SongPreviewPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  calibration = new Calibration(this.page, this.context, this.browser);

  public get nextButton() {
    return this.page.getByTestId('next-step-button');
  }

  public async goNext() {
    await this.nextButton.click();
  }

  public async navigateToGoNextWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, 'next-step-button', remoteMic);
    await this.page.keyboard.press('Enter', { delay: 40 });
    await this.page.waitForTimeout(300); // force wait for the animation to finish
  }

  public async playTheSong(skipIntro = true, calibration = true) {
    await this.page.getByTestId('play-song-button').click();

    if (calibration) {
      await this.calibration.approveDefaultCalibrationSetting();
    }

    await this.page.getByTestId('make-song-go-fast').click();
    if (skipIntro) {
      const locator = this.page.locator('[data-test="skip-intro-info"]');

      locator
        .waitFor({ timeout: 5_000 })
        .then(async () => {
          const isVisible = await locator.isVisible();
          if (isVisible) {
            await this.page.keyboard.press('Enter');
          }
        })
        .catch(() => undefined);
    }
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

  public async expectAlreadyEnteredPlayerNameToBe(playerNumber: number, playerName: string) {
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

  public async goToInputSelectionPage() {
    await expect(this.page.getByTestId('select-inputs-button')).toBeVisible();
    // there can be some weird issues on Firefox where the button is obscured by <html /> element
    // https://github.com/microsoft/playwright/issues/12298
    await this.page.waitForTimeout(100);
    await this.page.getByTestId('select-inputs-button').click({ force: true });
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

  public get songPreviewElement() {
    return this.page.getByTestId('song-preview');
  }

  public async expectPreviewSongToBe(expectedSongID: string) {
    await expect(this.songPreviewElement).toHaveAttribute('data-song', expectedSongID);
  }
}
