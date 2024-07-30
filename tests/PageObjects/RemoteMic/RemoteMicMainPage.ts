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

  public async goToSongList() {
    await this.page.getByTestId('menu-song-list').click();
  }
}
