import { Browser, BrowserContext, expect, Locator, Page } from '@playwright/test';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export type songActionType = 'resume' | 'restart' | 'exit' | 'edit';
export type settingsActionType = 'mic settings' | 'sync sound with lyrics';

export class PauseMenuPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get menuContainer() {
    return this.page.getByTestId('menu-container');
  }

  public getActionSelector(actionName: songActionType | settingsActionType) {
    if (actionName === 'mic settings' || actionName === 'sync sound with lyrics') {
      const settingNameToTechMap: Record<settingsActionType, string> = {
        'mic settings': 'settings',
        'sync sound with lyrics': 'lag',
      };
      return `input-${settingNameToTechMap[actionName]}`;
    } else {
      return `button-${actionName}-song`;
    }
  }

  public getActionButton(actionName: songActionType | settingsActionType) {
    return this.menuContainer.getByTestId(this.getActionSelector(actionName));
  }

  public async selectAction(actionName: songActionType | settingsActionType) {
    await expect(this.getActionButton(actionName)).toBeVisible();
    await this.getActionButton(actionName).click();
  }

  public async resumeSong() {
    await this.selectAction('resume');
  }

  public async restartSong() {
    await this.selectAction('restart');
  }

  public async exitSong() {
    await this.selectAction('exit');
  }

  public async selectMicSettings() {
    await this.selectAction('mic settings');
  }

  public get lagInput() {
    return this.getActionButton('sync sound with lyrics');
  }

  private async navigateToActionWithKeyboard(
    locator: Locator,
    actionName: songActionType | settingsActionType,
    remoteMic?: Page,
  ) {
    await expect(locator).toBeVisible();
    const actionButtonSelector = this.getActionSelector(actionName);
    await navigateWithKeyboard(this.page, actionButtonSelector, remoteMic);
  }

  public async confirmActionWithKeyboard(actionName: songActionType | settingsActionType, remoteMic?: Page) {
    const actionButton = this.getActionButton(actionName);
    await this.navigateToActionWithKeyboard(actionButton, actionName, remoteMic);
    await this.page.keyboard.press('Enter');
  }

  public async resumeSongWithKeyboard(remoteMic?: Page) {
    await this.confirmActionWithKeyboard('resume', remoteMic);
  }

  public async restartSongWithKeyboard(remoteMic?: Page) {
    await this.confirmActionWithKeyboard('restart', remoteMic);
  }

  public async exitSongWithKeyboard(remoteMic?: Page) {
    await this.confirmActionWithKeyboard('exit', remoteMic);
  }
}
