import { Browser, BrowserContext, Page } from '@playwright/test';

export class RateUnfinishedSongPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get rateSongContainer() {
    return this.page.getByTestId('rate-song-container');
  }

  public get lyricsSyncIssueButton() {
    return this.page.getByTestId('button-not-in-sync');
  }

  public async selectLyricsSyncIssue() {
    await this.lyricsSyncIssueButton.click();
  }

  public get wrongLyricsIssueButton() {
    return this.page.getByTestId('button-bad-lyrics');
  }

  public async selectWrongLyricsIssue() {
    await this.wrongLyricsIssueButton.click();
  }

  public get wrongVolumeIssueButton() {
    return this.page.getByTestId('button-wrong-volume');
  }

  public async selectVolumeIssue() {
    await this.wrongVolumeIssueButton.click();
  }

  public get exitSongButton() {
    return this.page.getByTestId('button-song-ok');
  }

  public async skipSongRating() {
    await this.exitSongButton.click();
  }

  public async submitYourSelectionAndExit() {
    await this.exitSongButton.click();
  }
}
