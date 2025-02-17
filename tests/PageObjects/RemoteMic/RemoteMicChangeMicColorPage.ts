import { expect } from '@playwright/experimental-ct-react';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { micColorToNumberMap, micColorType } from './consts';

export class RemoteMicChangeMicColorPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public async setOrChangeMicAssignment(micColor: micColorType) {
    await this.page.getByTestId(`change-to-player-${micColorToNumberMap[micColor]}`).click();
  }

  public getMicAssignmentLocator(micColor: micColorType) {
    return this.page.getByTestId(`change-to-player-${micColorToNumberMap[micColor]}`).getByTestId('mic-occupant');
  }

  public async expectAnyPlayerToHaveMicAssigned(micColor: micColorType, playerName: string) {
    await expect(this.getMicAssignmentLocator(micColor)).toBeVisible();
    await expect(this.getMicAssignmentLocator(micColor)).toHaveText(`(${playerName})`);
  }

  public get unassignButton() {
    return this.page.getByTestId('change-to-unset');
  }

  public async unassignOwnPlayer() {
    await this.page.getByTestId('change-to-unset').click();
  }

  public async expectPlayerToBeUnassigned() {
    await expect(this.unassignButton).toBeDisabled();
  }

  public async goBackToMainMenu() {
    await this.page.getByTestId('close-menu').click();
  }
}
