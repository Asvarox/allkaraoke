import { expect } from '@playwright/experimental-ct-react';
import { Browser, BrowserContext, Page } from '@playwright/test';

export class RemoteMicMainPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get playerNameInput() {
    return this.page.getByTestId('player-name-input');
  }

  public async enterPlayerName(name: string) {
    await this.playerNameInput.fill(name);
  }

  public async expectPlayerNameToBe(playerName: string) {
    await expect(this.playerNameInput).toHaveValue(playerName);
  }

  public async goToSongList() {
    await this.page.getByTestId('menu-song-list').click();
  }

  public async goToSettings() {
    await this.page.getByTestId('menu-settings').click();
  }

  public async expectPlayerToBeAssigned(micColor: 'blue' | 'red' | 'green' | 'yellow') {
    const colorToNumberMap = {
      blue: '0',
      red: '1',
      green: '2',
      yellow: '3',
    };
    await expect(this.page.getByTestId('indicator')).toHaveAttribute('data-player-number', colorToNumberMap[micColor]);
  }

  public async expectPlayerToBeUnassigned() {
    await expect(this.page.getByTestId('indicator')).toHaveAttribute('data-player-number', 'none');
  }

  public get noPermissionsToControlTheGameAlert() {
    return this.page.getByTestId('no-permissions-message');
  }

  public get remoteKeyboardElement() {
    return this.page.getByTestId('remote-keyboard');
  }

  public get joinGameButton() {
    return this.page.getByTestId('change-player');
  }
}
