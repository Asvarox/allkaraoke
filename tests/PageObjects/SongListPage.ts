import { Browser, BrowserContext, expect, Page } from '@playwright/test';
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

  public get songListElement() {
    return this.page.getByTestId('song-list-container');
  }

  public get songPreviewElement() {
    return this.page.getByTestId('song-preview');
  }

  public expectSelectedSongToBe(expectedSong: string) {
    return expect(this.songPreviewElement).toHaveAttribute('data-song', expectedSong);
  }
}
