import { Browser, BrowserContext, Page } from '@playwright/test';

export class SongEditAuthorAndVideoPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public get pageContainer() {
    return this.page.getByTestId('author-and-vid');
  }

  public get previousButton() {
    return this.page.getByTestId('previous-button');
  }

  public async previousStep() {
    await this.previousButton.click();
  }

  public get nextButton() {
    return this.page.getByTestId('next-button');
  }

  public async nextStep() {
    await this.nextButton.click();
  }

  public get authorNameInput() {
    return this.page.locator('[data-test="author-name"] input');
  }

  public async enterAuthorName(name: string) {
    await this.authorNameInput.fill(name);
  }

  public get authorUrlInput() {
    return this.page.locator('[data-test="author-url"] input');
  }

  public async enterAuthorURL(authorUrl: string) {
    await this.authorUrlInput.fill(authorUrl);
  }

  public get videoUrlInput() {
    return this.page.locator('[data-test="video-url"] input');
  }

  public async enterVideoURL(videoUrl: string) {
    await this.videoUrlInput.fill(videoUrl);
  }

  public get videoLookupButton() {
    return this.page.locator('[data-test="video-url"] button');
  }
}
