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

  public async unselectLanguage(language: string) {
    await expect(this.getCheckbox(language)).toHaveAttribute('data-testid', 'CheckBoxIcon');
    await this.getLanguageEntry(language).click();
  }

  public async ensureSongLanguageIsSelected(language: string) {
    await this.page.waitForTimeout(100);
    await expect(this.getCheckbox(language)).toBeVisible();
    if (!(await this.isLanguageSelectedStr(language))) {
      await this.getCheckbox(language).click();
    }
  }

  public async ensureSongLanguageIsDeselected(language: string) {
    if (await this.isLanguageSelectedStr(language)) {
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

  public async getAllLanguageCheckboxes() {
    const languageCheckbox = this.page.locator('[data-test^="lang-"] svg');
    await expect(languageCheckbox.first()).toBeVisible();

    return languageCheckbox.all();
  }

  public async ensureAllLanguagesAreSelected() {
    const languages = await this.getAllLanguageCheckboxes();

    for (const language of languages) {
      if (!(await this.isLanguageSelected(language))) {
        await language.click();
      }
    }
  }

  public async ensureAllLanguagesAreDeselected() {
    const languages = await this.getAllLanguageCheckboxes();

    for (const language of languages) {
      if (await this.isLanguageSelected(language)) {
        await language.click();
      }
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
