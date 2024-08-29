import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class RemoteMicSongLanguagesPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public getLanguageButton(language: string) {
    return this.page.getByTestId(language).locator('span');
  }

  public async selectLanguage(language: string) {
    await this.getLanguageButton(language).click();
  }

  public async expectSongLanguageToBeSelected(language: string) {
    await expect(this.getLanguageButton(language)).toHaveClass('text-active');
  }

  private async isLanguageSelected(language: string) {
    const languageClassAttribute = await this.getLanguageButton(language).getAttribute('class');
    return languageClassAttribute === 'text-active';
  }

  public async ensureSongLanguageIsSelected(language: string) {
    if (!(await this.isLanguageSelected(language))) {
      await this.selectLanguage(language);
    }
  }

  public async ensureSongLanguageIsDeselected(language: string) {
    if (await this.isLanguageSelected(language)) {
      await this.selectLanguage(language);
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
