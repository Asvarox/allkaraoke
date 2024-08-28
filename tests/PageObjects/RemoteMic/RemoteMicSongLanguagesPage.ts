import { Browser, BrowserContext, Page } from '@playwright/test';

export class RemoteMicSongLanguagesPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public getLanguageButton(language: string) {
    return this.page.getByTestId(language);
  }

  public async selectLanguage(language: string) {
    await this.getLanguageButton(language).click();
  }

  public getLanguageClassAttribute(language: string) {
    return this.getLanguageButton(language).locator('span').getAttribute('class');
  }

  public async ensureSongLanguageIsSelected(language: string) {
    if ((await this.getLanguageClassAttribute(language)) === '') {
      await this.selectLanguage(language);
    }
  }

  public async ensureSongLanguageIsDeselected(language: string) {
    if ((await this.getLanguageClassAttribute(language)) === 'text-active') {
      await this.selectLanguage(language);
    }
  }

  public async goBackToSongList() {
    await this.page.click('body', { position: { x: 0, y: 0 } });
  }
}
