import { expect } from '@playwright/experimental-ct-react';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { RemoteTabBar } from '../RemoteMic/remoteComponents/RemoteTabBar';
import { RemoteToolbar } from '../RemoteMic/remoteComponents/RemoteToolbar';

export class RemoteMicMainPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  remoteTabBar = new RemoteTabBar(this.page, this.context, this.browser);
  remoteToolbar = new RemoteToolbar(this.page, this.context, this.browser);

  public get playerNameInput() {
    return this.page.getByTestId('player-name-input');
  }

  public async enterPlayerName(name: string) {
    await this.playerNameInput.fill(name);
  }

  public async expectPlayerNameToBe(playerName: string) {
    await expect(this.playerNameInput).toHaveValue(playerName);
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

  public get enterKeyboardButton() {
    return this.page.getByTestId('keyboard-enter');
  }

  public async pressEnterOnRemoteMic() {
    await this.enterKeyboardButton.click();
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

  public async expectConnectButtonToBe(buttonActivity: 'enabled' | 'disabled') {
    const activityToBooleanMap = {
      enabled: 'false',
      disabled: 'true',
    };
    await expect(this.connectButton).toHaveAttribute('data-disabled', activityToBooleanMap[buttonActivity]);
  }

  public async clickToConnectMic() {
    await this.expectConnectButtonToBe('enabled');
    await this.connectButton.click();
  }

  public get searchSongInput() {
    return this.page.getByTestId('search-song-input');
  }

  public async searchTheSong(songID: string) {
    await this.searchSongInput.fill(songID);
  }

  public get backArrowKeyboardButton() {
    return this.page.getByTestId('keyboard-backspace');
  }

  public async goBackByKeyboard() {
    await this.backArrowKeyboardButton.click();
  }

  public async expectMicInputStateToBe(stateName: 'on' | 'off') {
    await expect(this.page.getByTestId('monitoring-state')).toContainText(stateName, { ignoreCase: true });
  }
}
