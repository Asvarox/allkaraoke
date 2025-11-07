import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { Checkboxes, checkboxesStateType } from '../components/checkboxes';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export type languagesType = 'Polish' | 'English' | 'Spanish' | 'French';

export class SongLanguagesPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public getLanguageCheckbox(language: languagesType) {
    return this.page.getByTestId(`lang-${language}`).locator(`svg`);
  }

  private getLanguageCheckboxComponent(language: languagesType) {
    return new Checkboxes(this.page, this.context, this.browser, this.getLanguageCheckbox(language));
  }

  public async isLanguageSelected(language: languagesType) {
    return await this.getLanguageCheckboxComponent(language).isCheckboxSelected();
  }

  public async unselectLanguage(language: languagesType) {
    await this.getLanguageCheckboxComponent(language).expectCheckboxStateToBe('selected');
    await this.getLanguageCheckbox(language).click();
  }

  public async ensureLanguageStateToBe(language: languagesType, state: checkboxesStateType) {
    await this.getLanguageCheckboxComponent(language).ensureCheckboxStateToBe(state);
  }

  public async expectLanguageStateToBe(language: languagesType, expectedState: checkboxesStateType) {
    await this.getLanguageCheckboxComponent(language).expectCheckboxStateToBe(expectedState);
  }

  public async getAllLanguageCheckboxes() {
    const languageCheckbox = this.page.locator('[data-test^="lang-"] svg');
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

  public async goBackToMainMenu() {
    await this.page.getByTestId('close-exclude-languages').click();
  }

  public async continueAndGoToSongList() {
    await this.page.getByTestId('close-exclude-languages').click();
    await expect(this.page.getByTestId('song-preview')).toBeVisible();
  }

  public async navigateToSongListWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, 'close-exclude-languages', remoteMic);
  }

  public get allLanguagesExcludedAlert() {
    return this.page.getByTestId('all-languages-excluded-warning');
  }
}
