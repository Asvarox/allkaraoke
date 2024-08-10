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

  public async expectPlayerToBeAssigned(micColor: string) {
    if (micColor === 'blue') {
      await expect(this.page.getByTestId('indicator')).toHaveAttribute('data-player-number', '0');
    } else if (micColor === 'red') {
      await expect(this.page.getByTestId('indicator')).toHaveAttribute('data-player-number', '1');
    } else if (micColor === 'green') {
      await expect(this.page.getByTestId('indicator')).toHaveAttribute('data-player-number', '2');
    } else if (micColor === 'yellow') {
      await expect(this.page.getByTestId('indicator')).toHaveAttribute('data-player-number', '3');
    }
  }

  public async expectPlayerToBeUnassign() {
    await expect(this.page.getByTestId('indicator')).toHaveAttribute('data-player-number', 'none');
  }
}
