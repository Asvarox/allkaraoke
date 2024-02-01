import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class SongLanguagesPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

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
    const attributeValue = await this.getCheckbox(language).getAttribute('data-testid');

    if (attributeValue === 'CheckBoxOutlineBlankIcon') {
      await this.getLanguageEntry(language).click();
    }
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
