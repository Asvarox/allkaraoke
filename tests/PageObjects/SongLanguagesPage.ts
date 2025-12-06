import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { Checkboxes, checkboxesStateType } from '../components/checkboxes';
import { SongListPagePO } from '../PageObjects/SongListPage';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export type languagesType = 'Polish' | 'English' | 'Spanish' | 'French';

export class SongLanguagesPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public getLanguageCheckbox(language: languagesType | 'any') {
    if (language === 'any') {
      return this.page.locator('[data-test^="lang-"]');
    } else {
      return this.page.getByTestId(`lang-${language}`);
    }
  }

  private getLanguageCheckboxComponent(language: languagesType) {
    return new Checkboxes(this.page, this.context, this.browser, this.getLanguageCheckbox(language));
  }

  public async isLanguageSelected(language: languagesType) {
    return await this.getLanguageCheckboxComponent(language).isCheckboxSelected();
  }

  private async ensureLanguageStateToBe(language: languagesType, state: checkboxesStateType) {
    await this.getLanguageCheckboxComponent(language).ensureCheckboxStateToBe(state);
  }

  public async ensureLanguageToBeSelected(language: languagesType) {
    await this.ensureLanguageStateToBe(language, 'selected');
  }

  public async ensureLanguageToBeUnselected(language: languagesType) {
    await this.ensureLanguageStateToBe(language, 'unselected');
  }

  private async expectLanguageStateToBe(language: languagesType, expectedState: checkboxesStateType) {
    await this.getLanguageCheckboxComponent(language).expectCheckboxStateToBe(expectedState);
  }

  public async expectLanguageToBeSelected(language: languagesType) {
    await this.expectLanguageStateToBe(language, 'selected');
  }

  public async expectLanguageToBeUnselected(language: languagesType) {
    await this.expectLanguageStateToBe(language, 'unselected');
  }

  public async getAllLanguageCheckboxes() {
    const languageCheckbox = this.getLanguageCheckbox('any');
    await expect(languageCheckbox.first()).toBeVisible();
    return languageCheckbox.all();
  }

  public async ensureAllLanguagesToBe(state: checkboxesStateType) {
    const languages = await this.getAllLanguageCheckboxes();

    for (const language of languages) {
      const checkboxElement = new Checkboxes(this.page, this.context, this.browser, language);
      if (state === 'selected') {
        if (!(await checkboxElement.isCheckboxSelected())) {
          await language.click();
        }
      }
      if (state === 'unselected') {
        if (await checkboxElement.isCheckboxSelected()) {
          await language.click();
        }
      }
      await checkboxElement.expectCheckboxStateToBe(state);
    }
  }

  returnToMenuSelector = 'close-exclude-languages';

  public get returnToMenuButton() {
    return this.page.getByTestId(this.returnToMenuSelector);
  }

  public async goBackToMainMenu() {
    await this.returnToMenuButton.click();
  }

  public async continueAndGoToSongList() {
    const songList = new SongListPagePO(this.page, this.context, this.browser);

    await this.returnToMenuButton.click();
    await expect(songList.songPreviewElement).toBeVisible();
    return songList;
  }

  public async navigateToSongListWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, this.returnToMenuSelector, remoteMic);
  }

  public get allLanguagesExcludedAlert() {
    return this.page.getByTestId('all-languages-excluded-warning');
  }
}
