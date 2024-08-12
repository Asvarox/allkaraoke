import { Browser, BrowserContext, expect, Locator, Page } from '@playwright/test';

export class RemoteSongListPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public getSongElement(songID: string) {
    return this.page.getByTestId(songID);
  }

  public get addSongButton() {
    return this.page.getByTestId('add-song-button');
  }

  public async addSongToFavouriteList(songID: string) {
    await this.getSongElement(songID).locator(this.addSongButton).click();
  }

  public get unselectSongButton() {
    return this.page.getByTestId('unselect-song-button');
  }

  public async removeSongFromFavouriteList(songID: string) {
    await this.getSongElement(songID).locator(this.unselectSongButton).click();
  }

  public async expectSongToBeVisible(songID: string) {
    await expect(this.getSongElement(songID)).toBeVisible();
  }

  public async expectSongNotToBeVisible(songID: string) {
    await expect(this.getSongElement(songID)).not.toBeVisible();
  }

  public async goToMicrophonePage() {
    await this.page.getByTestId('menu-microphone').click();
  }

  public get yourListButton() {
    return this.page.getByTestId('your-list-button');
  }

  public async goToYourFavouriteList() {
    await this.yourListButton.click();
  }

  public async expectListToBeSelected(listName: Locator) {}
}
