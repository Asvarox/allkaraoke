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

  public rowText(text: string) {
    return this.page.getByText(text);
  }

  public rowContaining(text: string) {
    return this.page.getByRole('row').filter({ hasText: text });
  }

  public deleteButtonFor(title: string) {
    return this.page.getByLabel(`Delete ${title}`);
  }

  public async deleteSong(title: string) {
    await this.deleteButtonFor(title).click();
  }

  public async deleteSongByExternalId(externalSongId: string) {
    await this.rowContaining(externalSongId)
      .getByLabel(/Delete/)
      .click();
  }

  public async editSongByExternalId(externalSongId: string) {
    await this.rowContaining(externalSongId).getByLabel(/Edit/).click();
  }

  public async expectPasswordClearedFromSessionStorage() {
    await expect.poll(() => this.page.evaluate(() => sessionStorage.getItem('admin-panel-password'))).toBeNull();
  }
}
