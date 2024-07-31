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
}
