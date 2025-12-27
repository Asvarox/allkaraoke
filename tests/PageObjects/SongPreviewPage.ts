import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { Calibration } from '../components/Calibration';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export type playerSideType = 'p1' | 'p2' | 'coop';
export type trackNameType = 'Track 1' | 'Track 2';
type settingsOptionType = 'game mode' | 'difficulty setting';
type gameModeType = 'Duel' | 'Pass The Mic' | 'Cooperation';
type difficultyLevelType = 'Easy' | 'Medium' | 'Hard';

export const playerSideToIndexMap: Record<playerSideType, number> = {
  p1: 0,
  p2: 1,
  coop: 0,
};

export const trackNameToNumberMap: Record<trackNameType, number> = {
  'Track 1': 1,
  'Track 2': 2,
};

export class SongPreviewPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  calibration = new Calibration(this.page, this.context, this.browser);

  private nextButtonSelector = 'next-step-button';
  private playSongButtonSelector = 'play-song-button';
  private gameModeSettingSelector = 'game-mode-setting';
  private difficultySettingSelector = 'difficulty-setting';

  public settingOptionToSelectorMap: Record<settingsOptionType, string> = {
    'game mode': this.gameModeSettingSelector,
    'difficulty setting': this.difficultySettingSelector,
  } as const;

  public get nextButton() {
    return this.page.getByTestId(this.nextButtonSelector);
  }

  public async goNext() {
    await this.nextButton.click();
  }

  public async navigateToGoNextWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, this.nextButtonSelector, remoteMic);
    await this.page.keyboard.press('Enter', { delay: 40 });
    await this.page.waitForTimeout(300); // force wait for the animation to finish
  }

  public async playTheSong(skipIntro = true, calibration = true) {
    await this.page.getByTestId(this.playSongButtonSelector).click();

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
    await navigateWithKeyboard(this.page, this.playSongButtonSelector, remoteMic);
    await this.page.keyboard.press('Enter');
  }

  public getSettingElement(settingsOption: settingsOptionType) {
    return this.page.getByTestId(this.settingOptionToSelectorMap[settingsOption]);
  }

  public getSelectedSettingElement(
    settingsOption: settingsOptionType,
    expectedMode: gameModeType | difficultyLevelType,
  ) {
    return this.page.locator(
      `[data-test="${this.settingOptionToSelectorMap[settingsOption]}"][data-test-value="${expectedMode}"]`,
    );
  }

  private async ensureElementToBeSet(
    settingsOption: settingsOptionType,
    expectedMode: gameModeType | difficultyLevelType,
    keyboard = false,
  ) {
    const settingOptionElement = this.getSettingElement(settingsOption);
    const selectedSettingOptionElement = this.getSelectedSettingElement(settingsOption, expectedMode);

    while (await selectedSettingOptionElement.isHidden()) {
      if (keyboard) {
        await this.page.keyboard.press('Enter');
      } else {
        await settingOptionElement.click();
      }
    }
    await expect(selectedSettingOptionElement).toBeVisible();
  }

  public async ensureGameModeToBeSet(expectedMode: gameModeType) {
    await this.ensureElementToBeSet('game mode', expectedMode);
  }

  public async ensureGameModeToBeSetWithKeyboard(expectedMode: gameModeType) {
    await this.ensureElementToBeSet('game mode', expectedMode, true);
  }

  public async navigateToGameModeSettingsWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, this.gameModeSettingSelector, remoteMic);
  }

  public async ensureDifficultySettingsToBeSet(expectedLevel: difficultyLevelType) {
    await this.ensureElementToBeSet('difficulty setting', expectedLevel);
  }

  public async ensureDifficultySettingsToBeSetWithKeyboard(expectedLevel: difficultyLevelType) {
    await this.ensureElementToBeSet('difficulty setting', expectedLevel, true);
  }

  public async navigateToDifficultySettingsWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, this.difficultySettingSelector, remoteMic);
  }

  public async navigateAndSetDifficultySettingsWithKeyboard(expectedLevel: difficultyLevelType, remoteMic?: Page) {
    await this.navigateToDifficultySettingsWithKeyboard(remoteMic);
    await this.ensureDifficultySettingsToBeSetWithKeyboard(expectedLevel);
  }

  public getPlayerNameInputSelector(playerSide: playerSideType) {
    return `player-${playerSideToIndexMap[playerSide]}-name`;
  }

  public getPlayerNameInput(playerSide: playerSideType) {
    const playerInputSelector = this.getPlayerNameInputSelector(playerSide);
    return this.page.getByTestId(playerInputSelector);
  }

  public async navigateToChangePlayerNameWithKeyboard(playerSide: playerSideType, remoteMic?: Page) {
    const playerInputSelector = this.getPlayerNameInputSelector(playerSide);
    await navigateWithKeyboard(this.page, playerInputSelector, remoteMic);
    await this.page.keyboard.press('Enter', { delay: 40 });
  }

  public async enterPlayerNameWithKeyboard(playerName: string) {
    await this.page.keyboard.type(playerName);
    await this.page.keyboard.press('Enter');
  }

  public async navigateAndEnterPlayerNameWithKeyboard(playerSide: playerSideType, playerName: string) {
    await this.navigateToChangePlayerNameWithKeyboard(playerSide);
    await this.enterPlayerNameWithKeyboard(playerName);
  }

  public async expectEnteredPlayerNameToBe(playerSide: playerSideType, playerName: string) {
    await expect(this.getPlayerNameInput(playerSide)).toHaveAttribute('value', `${playerName}`);
  }

  public async expectEnteredPlayerNameToBePrefilledWith(playerSide: playerSideType, playerName: string) {
    await expect(this.getPlayerNameInput(playerSide)).toHaveAttribute('placeholder', `${playerName}`);
  }

  public async expectRecentPlayerListToContainName(name: string) {
    await this.getPlayerNameInput('p1').click();
    await expect(this.page.getByRole('listbox')).toContainText(`${name}`);
    await this.page.keyboard.press('Enter');
  }

  public getPlayerTrackSelector(playerSide: playerSideType) {
    return `player-${playerSideToIndexMap[playerSide]}-track-setting`;
  }

  public getPlayerTrackSettings(playerSide: playerSideType) {
    const playerTrackSelector = this.getPlayerTrackSelector(playerSide);
    return this.page.getByTestId(playerTrackSelector);
  }

  public async navigateAndTogglePlayerTrackSettingsWithKeyboard(playerSide: playerSideType, remoteMic?: Page) {
    const playerTrackSelector = this.getPlayerTrackSelector(playerSide);
    await navigateWithKeyboard(this.page, playerTrackSelector, remoteMic);
    await this.page.keyboard.press('Enter');
  }

  public async expectPlayerTrackNumberToBe(playerSide: playerSideType, trackName: trackNameType) {
    await expect(this.getPlayerTrackSettings(playerSide)).toHaveAttribute(
      'data-test-value',
      `${trackNameToNumberMap[trackName]}`,
    );
  }

  public get setupMicsButton() {
    return this.page.getByTestId('select-inputs-button');
  }

  public async goToInputSelectionPage() {
    await expect(this.setupMicsButton).toBeVisible();
    // there can be some weird issues on Firefox where the button is obscured by <html /> element
    // https://github.com/microsoft/playwright/issues/12298
    await this.page.waitForTimeout(100);
    await this.setupMicsButton.click({ force: true });
  }

  public getUnavailableStatusPlayer(playerSide: playerSideType) {
    return this.page
      .getByTestId(`indicator-player-${playerSideToIndexMap[playerSide]}`)
      .getByTestId('status-unavailable');
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
