import { Browser, BrowserContext, expect, Locator, Page } from '@playwright/test';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class SongLanguagesPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public getLanguageEntry(language: string) {
    return this.page.getByTestId(`lang-${language}`);
  }

  public getCheckbox(language: string) {
    return this.page.locator(`[data-test = "lang-${language}"] svg`);
  }

  public async selectLanguage(language: string) {
    await expect(this.getCheckbox(language)).toHaveAttribute('data-testid', 'CheckBoxOutlineBlankIcon');
    await this.getLanguageEntry(language).click();
  }

  public async unselectLanguage(language: string) {
    await expect(this.getCheckbox(language)).toHaveAttribute('data-testid', 'CheckBoxIcon');
    await this.getLanguageEntry(language).click();
  }

  public async ensureSongLanguageIsSelected(language: string) {
    if (!(await this.isLanguageSelectedStr(language))) {
      await this.getCheckbox(language).click();
    }
  }

  private async isLanguageSelectedStr(language: string) {
    const languageCheckbox = this.getCheckbox(language);
    return this.isLanguageSelected(languageCheckbox);
  }

  private async isLanguageSelected(languageCheckbox: Locator) {
    const languageCheckboxValue = await languageCheckbox.getAttribute('data-testid');
    return languageCheckboxValue === 'CheckBoxIcon';
  }

  public async ensureAllLanguagesAreSelected() {
    const languageCheckbox = this.page.locator('[data-test^="lang-"] svg');

    await expect(languageCheckbox.first()).toBeVisible();
    const languages = await languageCheckbox.all();

    for (const language of languages) {
      if (!(await this.isLanguageSelected(language))) {
        await language.click();
      }
    }
  }

  public async goBackToMainMenu() {
    await this.page.getByTestId('close-exclude-languages').click();
  }

  public async continueAndGoToSongList() {
    await this.page.getByTestId('close-exclude-languages').click();
  }

  public async navigateToSongListWithKeyboard(remoteMic?: Page) {
    await navigateWithKeyboard(this.page, 'close-exclude-languages', remoteMic);
  }

  public get allLanguagesExcludedAlert() {
    return this.page.getByTestId('all-languages-excluded-warning');
  }
}
