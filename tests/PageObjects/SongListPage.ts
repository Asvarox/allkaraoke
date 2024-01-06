import { Browser, BrowserContext, Page } from '@playwright/test';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class SongListPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async goToGroupNavigation(groupName: any) {
    await this.page.getByTestId(`group-navigation-${groupName}`).click();
  }

  public getSongElement(songID: string) {
    return this.page.getByTestId(`song-${songID}`);
  }

  public async navigateToSongWithKeyboard(songID: string) {
    await navigateWithKeyboard(this.page, `song-${songID}`);
  }
}
