import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { AdminSharedSongsTablePO } from './admin-shared-songs-table';

export class AdminSharedSongsPagePO {
  public readonly table: AdminSharedSongsTablePO;

  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {
    this.table = new AdminSharedSongsTablePO(page);
  }

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
    return this.page.getByRole('heading', { name: 'Shared Songs Management' });
  }

  public get searchInput() {
    return this.page.getByRole('textbox', { name: 'Search' });
  }

  public async signIn(password: string) {
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  public async search(text: string) {
    await this.searchInput.fill(text);
  }

  public async logout() {
    await this.logoutButton.click();
  }

  public async expectPasswordClearedFromSessionStorage() {
    await expect.poll(() => this.page.evaluate(() => sessionStorage.getItem('admin-panel-password'))).toBeNull();
  }
}
