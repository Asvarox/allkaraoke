import { Browser, BrowserContext, expect, Page } from '@playwright/test';

type issueType = 'not-in-sync' | 'bad-lyrics' | 'too-quiet' | 'too-loud';

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

  public get tooQuietIssueButton() {
    return this.page.getByTestId('button-too-quiet');
  }

  public async selectTooQuietIssue() {
    await this.tooQuietIssueButton.click();
  }

  public get tooLoudIssueButton() {
    return this.page.getByTestId('button-too-loud');
  }

  public async selectTooLoudIssue() {
    await this.tooLoudIssueButton.click();
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

  public getIssueCheckbox(issue: issueType) {
    return this.page.getByTestId(`button-${issue}`).locator('svg');
  }

  public async expectIssueToBeSelected(issue: issueType) {
    await expect(this.getIssueCheckbox(issue)).toHaveAttribute('data-testid', 'CheckBoxIcon');
  }

  public async expectIssueToBeDeselected(issue: issueType) {
    await expect(this.getIssueCheckbox(issue)).toHaveAttribute('data-testid', 'CheckBoxOutlineBlankIcon');
  }

  public get asLoudAsItCouldBeInfo() {
    return this.page.getByText('Too quiet').locator('~span', { hasText: '(already as loud as it could be)' });
  }
}
