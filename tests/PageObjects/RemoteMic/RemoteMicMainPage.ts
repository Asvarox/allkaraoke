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

  public async pressEnterByKeyboard() {
    await this.page.getByTestId('keyboard-enter').click();
  }

  public get joinGameButton() {
    return this.page.getByTestId('change-player');
  }

  public get readyButton() {
    return this.page.getByTestId('ready-button');
  }

  public async pressReadyOnRemoteMic() {
    await this.readyButton.click();
  }

  public get gameCodeInput() {
    return this.page.getByTestId('game-code-input');
  }

  public async expectGameCodeToBe(gameCode: string) {
    await expect(this.gameCodeInput).toHaveValue(gameCode);
  }

  public get connectButton() {
    return this.page.getByTestId('connect-button');
  }

  public async expectPlayerToBeConnected() {
    await expect(this.connectButton).toContainText('CONNECTED', { ignoreCase: true });
  }

  public async expectPlayerToBeDisconnected() {
    await expect(this.connectButton).toContainText('DISCONNECTED', { ignoreCase: true });
  }

  public async expectConnectButtonActivityToBeAs(buttonActivity: 'enabled' | 'disabled') {
    const activityToBooleanMap = {
      enabled: 'false',
      disabled: 'true',
    };
    await expect(this.connectButton).toHaveAttribute('data-disabled', activityToBooleanMap[buttonActivity]);
  }

  public async clickToConnectMic() {
    await this.expectConnectButtonActivityToBeAs('enabled');
    await this.connectButton.click();
  }
}
