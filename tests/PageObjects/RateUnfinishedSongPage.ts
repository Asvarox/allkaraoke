import { Browser, BrowserContext, Page } from '@playwright/test';
import { Checkboxes, checkboxesStateType } from '../components/checkboxes';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

type issueType = 'lyrics not sync' | 'wrong lyrics' | 'too quiet' | 'too loud';

const issueNameToTechMap: Record<issueType, string> = {
  'lyrics not sync': 'not-in-sync',
  'wrong lyrics': 'bad-lyrics',
  'too quiet': 'too-quiet',
  'too loud': 'too-loud',
} as const;

export class RateUnfinishedSongPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get rateSongContainer() {
    return this.page.getByTestId('rate-song-container');
  }

  private getIssueCheckbox(issue: issueType) {
    return this.page.getByTestId(`button-${issueNameToTechMap[issue]}`);
  }

  public get lyricsSyncIssueButton() {
    return this.getIssueCheckbox('lyrics not sync');
  }

  public get wrongLyricsIssueButton() {
    return this.getIssueCheckbox('wrong lyrics');
  }

  public get tooQuietIssueButton() {
    return this.getIssueCheckbox('too quiet');
  }

  public get tooLoudIssueButton() {
    return this.getIssueCheckbox('too loud');
  }

  private getIssueCheckboxComponent(issue: issueType) {
    return new Checkboxes(this.page, this.context, this.browser, this.getIssueCheckbox(issue));
  }

  private async ensureIssueStateToBe(issue: issueType, state: checkboxesStateType) {
    await this.getIssueCheckboxComponent(issue).ensureCheckboxStateToBe(state);
  }

  public async ensureIssueToBeSelected(issue: issueType) {
    await this.ensureIssueStateToBe(issue, 'selected');
  }

  public async ensureIssueToBeUnselected(issue: issueType) {
    await this.ensureIssueStateToBe(issue, 'unselected');
  }

  private async expectIssueStateToBe(issue: issueType, state: checkboxesStateType) {
    await this.getIssueCheckboxComponent(issue).expectCheckboxStateToBe(state);
  }

  public async expectIssueToBeSelected(issue: issueType) {
    await this.expectIssueStateToBe(issue, 'selected');
  }

  public async expectIssueToBeUnselected(issue: issueType) {
    await this.expectIssueStateToBe(issue, 'unselected');
  }

  private exitSongSelector = 'button-song-ok';

  public get exitSongButton() {
    return this.page.getByTestId(this.exitSongSelector);
  }

  public async skipSongRating() {
    await this.exitSongButton.click();
  }

  public async submitYourSelectionAndExit() {
    await this.exitSongButton.click();
  }

  public get asLoudAsItCouldBeInfo() {
    return this.page.getByText('Too quiet').locator('~span', { hasText: '(already as loud as it could be)' });
  }

  public async selectIssueWithKeyboard(issue: issueType, remoteMic?: Page) {
    await navigateWithKeyboard(this.page, `button-${issueNameToTechMap[issue]}`, remoteMic);
    await this.page.keyboard.press('Enter');
  }

  public async submitIssueWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, this.exitSongSelector, remoteMic);
    await this.page.keyboard.press('Enter');
  }
}
