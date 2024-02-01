import { Browser, BrowserContext, Page } from '@playwright/test';

export class SongEditBasicInfoPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public get pageContainer() {
    return this.page.getByTestId('basic-data');
  }

  public get previousButton() {
    return this.page.getByTestId('previous-button');
  }

  public get nextButton() {
    return this.page.getByTestId('next-button');
  }

  public async nextStep() {
    await this.nextButton.click();
  }

  public get urlSourceInput() {
    return this.page.locator('[data-test="source-url"] input');
  }

  public async enterSourceURL(urlSource: string) {
    await this.urlSourceInput.fill(urlSource);
  }

  public get txtInput() {
    return this.page.getByTestId('input-txt');
  }

  public async enterSongTXT(txtFile: string) {
    await this.txtInput.fill(txtFile);
  }

  public get duplicateSongAlert() {
    return this.page.getByTestId('possible-duplicate');
  }
}
