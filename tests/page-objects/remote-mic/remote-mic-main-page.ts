import { expect } from '@playwright/experimental-ct-react';
import { Browser, BrowserContext, Page } from '@playwright/test';

import { SongGroupsNavigation } from '../../components/song-groups-navigation';
import { RemoteTabBar } from '../../page-objects/remote-mic/remote-components/remote-tab-bar';
import { RemoteToolbar } from '../../page-objects/remote-mic/remote-components/remote-toolbar';
import { micColorToNumberMap, micColorType } from './consts';

export class RemoteMicMainPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  remoteTabBar = new RemoteTabBar(this.page, this.context, this.browser);
  remoteToolbar = new RemoteToolbar(this.page, this.context, this.browser);
  // The song groups row the phone mirrors from the song selection screen — same component as the
  // screen's own row, so both sides can be asserted the same way.
  songGroups = new SongGroupsNavigation(this.page, this.context, this.browser);

  // Name entry now lives in the top bar (always available, regardless of connection state) rather
  // than as a wizard step — see RenameModal.
  public get topBarPlayerNameButton() {
    return this.page.getByTestId('topbar-player-name');
  }

  public async enterPlayerName(name: string) {
    await this.topBarPlayerNameButton.click();
    await this.page.getByTestId('rename-input').fill(name);
    await this.page.getByTestId('rename-save-button').click();
  }

  public async expectPlayerNameToBe(playerName: string | RegExp) {
    await expect(this.topBarPlayerNameButton).toContainText(playerName);
  }

  indicatorElement = this.page.getByTestId('indicator');

  public async expectPlayerToBeAssigned(micColor: micColorType) {
    await expect(this.indicatorElement).toHaveAttribute('data-player-number', micColorToNumberMap[micColor]);
  }

  public async expectPlayerToBeUnassigned() {
    await expect(this.indicatorElement).toHaveAttribute('data-player-number', 'none');
  }

  public get noPermissionsToControlTheGameAlert() {
    return this.page.getByTestId('no-permissions-message');
  }

  public get remoteKeyboardElement() {
    return this.page.getByTestId('remote-keyboard');
  }

  public async expectKeyboardModeToBe(mode: 'classic' | 'mirror' | 'song-selection') {
    await expect(this.remoteKeyboardElement).toHaveAttribute('data-mode', mode);
  }

  public mirroredControl(name: string) {
    return this.page.getByTestId(`control-${name}`);
  }

  public get arrowUpButton() {
    return this.page.getByTestId('arrow-up');
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

  public async goToChangeMicColor() {
    await this.joinGameButton.click();
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

  public get connectionStatusElement() {
    return this.page.getByTestId('connection-status');
  }
  public async expectPlayerToBeConnected() {
    await expect(this.connectionStatusElement).toHaveText(/(?:connected|\d+ms)/i);
  }

  public async expectPlayerToBeDisconnected() {
    await expect(this.connectionStatusElement).toContainText('DISCONNECTED', { ignoreCase: true });
  }

  public get confirmNameButton() {
    return this.page.getByTestId('confirm-name-button');
  }

  public async connect() {
    // The game code auto-connects once fully entered (e.g. preloaded from the URL) — no button
    // click needed. The "Set Your Name" step only shows up when there's no remembered name yet.
    // Check localStorage directly rather than a bounded wait — waiting out a fixed timeout on every
    // (common) reconnect eats into the toast auto-dismiss window other assertions rely on.
    const hasStoredName = await this.page.evaluate(() => localStorage.getItem('remote_mic_name') !== null);
    if (!hasStoredName) {
      await this.confirmNameButton.waitFor({ state: 'visible', timeout: 20_000 });
      await this.confirmNameButton.click();
    }
    await this.expectPlayerToBeConnected();
  }

  public async expectConnectActionToBeUnavailable() {
    if (await this.connectButton.isVisible()) {
      await expect(this.connectButton).toBeDisabled();
      return;
    }

    await expect(this.connectButton).not.toBeVisible();
  }

  public get searchSongInput() {
    return this.page.getByTestId('search-song-input');
  }

  // Search mirrors the song selection screen's mobile layout: an icon button that expands into the
  // input, so it has to be opened before anything can be typed.
  public get searchSongButton() {
    return this.page.getByTestId('search-song-button');
  }

  public async searchTheSong(songID: string) {
    // Probe for the already-open input rather than for the button: `click()` auto-waits, so a
    // negative probe still tolerates the panel being mid-swap into the song-selection keyboard.
    if (!(await this.searchSongInput.isVisible())) {
      await this.searchSongButton.click();
    }
    await this.searchSongInput.fill(songID);
  }

  public get closeSearchSongButton() {
    return this.page.getByTestId('close-search-song-button');
  }

  public async closeTheSongSearch() {
    await this.closeSearchSongButton.click();
  }

  public get playlistPickerTrigger() {
    return this.page.getByTestId('playlist-picker-trigger');
  }

  public async selectPlaylist(name: string) {
    await this.playlistPickerTrigger.click();
    await this.page.getByTestId(`playlist-sheet-${name}`).click();
  }

  public async expectSelectedPlaylistToBe(name: string) {
    await expect(this.playlistPickerTrigger).toContainText(name, { ignoreCase: true });
  }

  public get backArrowKeyboardButton() {
    return this.page.getByTestId('keyboard-backspace');
  }

  public async goBackByKeyboard() {
    await this.backArrowKeyboardButton.click();
  }

  public async expectMicInputStateToBe(stateName: 'on' | 'off') {
    await expect(this.indicatorElement).toHaveAttribute('data-is-mic-on', stateName === 'on' ? 'true' : 'false');
  }

  public get pauseMenuButton() {
    return this.page.getByTestId('keyboard-backspace');
  }

  public async goToPauseMenuWithKeyboard() {
    await this.pauseMenuButton.click();
  }
}
