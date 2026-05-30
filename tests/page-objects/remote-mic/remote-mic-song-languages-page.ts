import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class RemoteMicSongLanguagesPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public getLanguageButton(language: string) {
    return this.page.getByTestId(language);
  }

  public async toggleLanguage(language: string) {
    await this.getLanguageButton(language).click();
  }

  public async expectSongLanguageToBeSelected(language: string) {
    await expect(this.getLanguageButton(language)).toHaveAttribute('data-active', 'true');
  }

  private async isLanguageSelected(language: string) {
    const languageActiveAttribute = await this.getLanguageButton(language).getAttribute('data-active');
    return languageActiveAttribute === 'true';
  }

  public async ensureSongLanguageIsSelected(language: string) {
    if (!(await this.isLanguageSelected(language))) {
      await this.toggleLanguage(language);
    }
  }

  public async ensureSongLanguageIsDeselected(language: string) {
    if (await this.isLanguageSelected(language)) {
      await this.toggleLanguage(language);
    }
  }

  public get languagesContainer() {
    return this.page.getByTestId('languages-container');
  }

  public async ensureAllSongLanguagesAreDeselected() {
    const languages = await this.languagesContainer.locator('button').locator('span').all();

    for (const language of languages) {
      if ((await language.getAttribute('class')) === 'text-active') {
        await language.click();
      }
    }
  }

  public async goBackToSongList() {
    await this.page.click('body', { position: { x: 0, y: 0 } });
  }
}
