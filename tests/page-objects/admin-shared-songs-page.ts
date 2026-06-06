import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class AdminSharedSongsPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get passwordInput() {
    return this.page.getByLabel('Admin password');
  }

  public get signInButton() {
    return this.page.getByRole('button', { name: 'Sign in' });
  }

  public get logoutButton() {
    return this.page.getByRole('button', { name: 'Logout' });
  }

  public get adminHeading() {
    return this.page.getByRole('heading', { name: 'Shared Songs Admin' });
  }

  public async signIn(password: string) {
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  public async logout() {
    await this.logoutButton.click();
  }

  public rowText(text: string) {
    return this.page.getByText(text);
  }

  public deleteButtonFor(title: string) {
    return this.page.getByLabel(`Delete ${title}`);
  }

  public async deleteSong(title: string) {
    await this.deleteButtonFor(title).click();
  }

  public async expectPasswordClearedFromSessionStorage() {
    await expect.poll(() => this.page.evaluate(() => sessionStorage.getItem('shared-songs-admin-password'))).toBeNull();
  }
}
