import { expect } from '@playwright/experimental-ct-react';
import { Browser, BrowserContext, Page } from '@playwright/test';

type micColorType = 'blue' | 'red' | 'green' | 'yellow';

export class RemoteMicChangeMicColorPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  micColorToNumberMap = {
    blue: '0',
    red: '1',
    green: '2',
    yellow: '3',
  };

  public async setOrChangeMicAssignment(micColor: micColorType) {
    await this.page.getByTestId(`change-to-player-${this.micColorToNumberMap[micColor]}`).click();
  }

  public getMicAssignmentLocator(micColor: micColorType) {
    return this.page.getByTestId(`change-to-player-${this.micColorToNumberMap[micColor]}`).getByTestId('mic-occupant');
  }

  public async expectPlayerToHaveMicAssigned(micColor: micColorType, playerName: string) {
    await expect(this.getMicAssignmentLocator(micColor)).toBeVisible();
    await expect(this.getMicAssignmentLocator(micColor)).toHaveText(`(${playerName})`);
  }

  public async unassignOwnPlayer() {
    await this.page.getByTestId('change-to-unset').click();
  }

  public async removeOwnPlayer() {
    await this.page.getByTestId('remove-player').click();
  }

  public async goBackToMainMenu() {
    await this.page.getByTestId('close-menu').click();
  }
}
