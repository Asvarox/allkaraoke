import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class JukeboxPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public get skipButtonElement() {
    return this.page.getByTestId('skip-button');
  }

  public async navigateToSkipSongByKeyboard() {
    await navigateWithKeyboard(this.page, 'skip-button');
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(500);
  }

  public get singSongElement() {
    return this.page.getByTestId('sing-button');
  }

  public async navigateToSingSongByKeyboard() {
    await navigateWithKeyboard(this.page, 'sing-button');
    await this.page.keyboard.press('Enter');
  }

  public get jukeboxElement() {
    return this.page.getByTestId('jukebox-container');
  }

  public get currentSongName() {
    return this.jukeboxElement.getAttribute('data-song');
  }

  public expectSkipSongWorks(songName: string) {
    return expect(this.jukeboxElement).not.toHaveAttribute('data-song', songName);
  }
}
