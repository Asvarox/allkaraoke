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

  public get rememberMeToggle() {
    return this.page.getByRole('switch', { name: /remember me/i });
  }

  public get logoutButton() {
    return this.page.getByRole('button', { name: 'Logout' });
  }

  public get processOldestUnverifiedButton() {
    return this.page.getByRole('button', { name: 'Process oldest unverified' });
  }

  public get adminHeading() {
    return this.page.getByRole('heading', { name: 'Shared Songs Management' });
  }

  public get searchInput() {
    return this.page.getByRole('textbox', { name: 'Search' });
  }

  public async signIn(password: string, rememberMe = false) {
    await this.passwordInput.fill(password);
    await this.setRememberMe(rememberMe);
    await this.signInButton.click();
  }

  public async setRememberMe(rememberMe: boolean) {
    const isRemembered = await this.rememberMeToggle.isChecked();

    if (isRemembered !== rememberMe) {
      await this.rememberMeToggle.click();
    }
  }

  public async search(text: string) {
    await this.searchInput.fill(text);
  }

  public async logout() {
    await this.logoutButton.click();
  }

  public async processOldestUnverifiedSong() {
    await this.processOldestUnverifiedButton.click();
  }

  public async expectPasswordStoredInSessionStorage(password: string) {
    await expect
      .poll(() =>
        this.page.evaluate(() => ({
          local: localStorage.getItem('admin-panel-password'),
          session: sessionStorage.getItem('admin-panel-password'),
        })),
      )
      .toEqual({ local: null, session: password });
  }

  public async expectPasswordStoredInLocalStorage(password: string) {
    await expect
      .poll(() =>
        this.page.evaluate(() => ({
          local: localStorage.getItem('admin-panel-password'),
          session: sessionStorage.getItem('admin-panel-password'),
        })),
      )
      .toEqual({ local: password, session: null });
  }

  public async expectPasswordClearedFromStorage() {
    await expect
      .poll(() =>
        this.page.evaluate(() => ({
          local: localStorage.getItem('admin-panel-password'),
          session: sessionStorage.getItem('admin-panel-password'),
        })),
      )
      .toEqual({ local: null, session: null });
  }
}
