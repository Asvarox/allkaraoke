import { Browser, BrowserContext, expect, Page } from '@playwright/test';

import { Calibration } from '../components/calibration';
import navigateWithKeyboard from '../steps/navigate-with-keyboard';

export class SongPreviewPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  calibration = new Calibration(this.page, this.context, this.browser);

  public get nextButton() {
    // In v2 song selection, 'game-mode-setting' is always visible in the expanded preview settings,
    // regardless of whether inputs are configured. 'play-song-button' only appears when inputs are set up.
    return this.page.getByTestId('game-mode-setting');
  }

  public async goNext() {
    // In v2, just wait for the settings panel to be visible (game-mode-setting is always rendered).
    await expect(this.nextButton).toBeVisible();
  }

  public async navigateToGoNextWithKeyboard(_remoteMic?: Page) {
    // In v2, the song settings are shown inline after expanding the preview.
    // No keyboard navigation is needed to reach settings — just verify they are visible.
    await expect(this.nextButton).toBeVisible();
    await this.page.waitForTimeout(300); // force wait for the animation to finish
  }

  public async playTheSong(skipIntro = true, calibration = true, unverifiedSong = false) {
    const playButton = this.page.getByTestId('play-song-button');
    await playButton.click();

    if (unverifiedSong) {
      const confirmPlayButton = this.page.getByTestId('confirm-play-unverified-song');
      await confirmPlayButton.click();
    }

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

  public async expectGameModeToBe(modeName: 'Pass The Mic' | 'Duel' | 'Cooperation') {
    await expect(this.gameModeSettingsElement).toHaveAttribute('data-test-value', `${modeName}`);
  }

  public async setGameModeReliably(targetMode: 'Pass The Mic' | 'Duel' | 'Cooperation') {
    await this.navigateToGameModeSettingsWithKeyboard();
    // Ensure button is properly focused before interacting
    await expect(this.gameModeSettingsElement).toHaveAttribute('data-e2e-focused', 'true');

    const maxClicks = 5;
    let clickCount = 0;

    // Use direct clicking instead of keyboard to avoid timing issues
    // Click until we reach the target mode
    let currentMode = await this.gameModeSettingsElement.getAttribute('data-test-value');
    while (currentMode !== targetMode && clickCount < maxClicks) {
      await this.gameModeSettingsElement.click();
      await expect(this.gameModeSettingsElement).not.toHaveAttribute('data-test-value', currentMode ?? '');
      currentMode = await this.gameModeSettingsElement.getAttribute('data-test-value');
      clickCount++;
    }

    if (clickCount >= maxClicks && currentMode !== targetMode) {
      throw new Error(
        `Failed to set game mode to "${targetMode}" after ${maxClicks} clicks. Current mode: "${currentMode}"`,
      );
    }

    await this.expectGameModeToBe(targetMode);
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

  public async goToInputSelectionPage() {
    const button = this.page.getByTestId('select-inputs-button');
    await button.waitFor({ state: 'attached' });
    // In v2 the settings panel may have overflow:hidden which prevents scrollIntoView.
    // Using evaluate to call the native click() method bypasses Playwright's viewport constraints.
    // https://github.com/microsoft/playwright/issues/12298
    await this.page.waitForTimeout(100);
    await button.evaluate((el) => (el as HTMLElement).click());
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
