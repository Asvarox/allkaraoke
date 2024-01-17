import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class EditSongsPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async searchSongs(songID: string) {
    await this.page.locator('[placeholder="Search"]').fill(songID);
  }

  public async hideSong(songID: string) {
    await this.searchSongs(songID);
    await this.page.locator(`[data-test="hide-song"][data-song="${songID}"]`).click();
  }

  public async expectSongToBeHidden(songID: string) {
    await this.searchSongs(songID);
    await expect(this.page.locator(`[data-test="restore-song"][data-song="${songID}"]`)).toBeVisible();
  }

  public async restoreSong(songID: string) {
    await this.searchSongs(songID);
    await this.page.locator(`[data-test="restore-song"][data-song="${songID}"]`).click();
  }

  public async expectSongToBeVisible(songID: string) {
    await this.searchSongs(songID);
    await expect(this.page.locator(`[data-test="hide-song"][data-song = "${songID}"]`)).toBeVisible();
  }

  public async editSong(songID: string) {
    await this.searchSongs(songID);
    await this.page.locator(`[data-test="edit-song"][data-song="${songID}"]`).click();
  }

  public async goToMainMenu() {
    await this.page.getByTestId('main-menu-link').click();
  }

  public async goToImportUltrastar() {
    await this.page.getByTestId('convert-song').click();
  }

  public async disagreeToShareAddSongs() {
    await this.page.getByTestId('share-songs-disagree').click();
  }

  public get lastUpdateElement() {
    return this.page.locator('[aria-label="Sort by Last Update descending"] svg');
  }

  public async sortByLastUpdateDESC() {
    await this.lastUpdateElement.click();
  }

  public getTableRowElement(rowNumber: number) {
    return this.page.locator('table tr.MuiTableRow-root').nth(rowNumber);
  }

  public getColumnHeader(name: string) {
    return this.page.locator(`[title="${name}"]`);
  }

  public getTableCellElement(rowNumber: number, cellNumber: number) {
    return this.getTableRowElement(rowNumber).locator('td').nth(cellNumber);
  }

  public async expectRowLastUpdateColumnToBeEmpty(rowNumber: number) {
    await expect(this.getTableRowElement(rowNumber).locator('td').nth(4)).toBeEmpty();
  }

  public async expectRowLastUpdateColumnToBe(rowNumber: number, date: string) {
    await expect(this.getTableRowElement(rowNumber).locator('abbr')).toHaveAttribute('title', date);
  }

  public async expandShowOrHideColumnList() {
    await this.page.locator('[aria-label="Show/Hide columns"]').click();
  }

  public async toggleColumnVisibility(name: string) {
    await this.expandShowOrHideColumnList();
    await this.page
      .locator('span.MuiTypography-body1.MuiFormControlLabel-label')
      .getByText(`${name}`, { exact: true })
      .click();
    await this.page.locator('.MuiBackdrop-invisible').click();
  }

  public async hideAllColumns() {
    await this.expandShowOrHideColumnList();
    await this.page.locator('.MuiButton-textPrimary').getByText('Hide all', { exact: true }).click();
  }

  public async showFiltersVisibility() {
    await this.page.locator('[aria-label="Show/Hide filters"] [data-testid="FilterListIcon"]').click();
  }

  public async filterByColumnName(name: string, phrase: string) {
    await this.showFiltersVisibility();
    await this.page.locator(`[title="Filter by ${name}"]`).fill(phrase);
  }
} //
