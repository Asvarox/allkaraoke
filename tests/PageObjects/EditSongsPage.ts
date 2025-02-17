import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { columnNameType } from '../PageObjects/RemoteMic/consts';

export class EditSongsPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

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

  public async downloadSong(songID: string) {
    await this.searchSongs(songID);
    await this.page.locator(`[data-test="download-song"][data-song="${songID}"]`).click();
  }

  public deleteSongButton(songID: string) {
    return this.page.locator(`[data-test="delete-song"][data-song="${songID}"]`);
  }

  public async deleteSong(songID: string) {
    await this.searchSongs(songID);
    await this.deleteSongButton(songID).click();
  }

  public async goToMainMenu() {
    await this.page.getByTestId('main-menu-link').click();
  }

  public get importUltrastarButton() {
    return this.page.getByTestId('convert-song');
  }

  public async goToConvertSong() {
    await this.importUltrastarButton.click();
  }

  public async disagreeToShareAddSongs() {
    await this.page.getByTestId('share-songs-disagree').click();
  }

  public get shareSongSwitch() {
    return this.page.getByTestId('share-songs-switch').getByRole('checkbox');
  }

  public getColumnDefaultSortingIcon(columnName: columnNameType) {
    return this.page.locator(`[aria-label="Sort by ${columnName} descending"] [data-testid="SyncAltIcon"]`);
  }

  public getColumnArrowDownwardSortingIcon(columnName: columnNameType) {
    return this.page.locator(`[aria-label="Sorted by ${columnName} descending"] [data-testid="ArrowDownwardIcon"]`);
  }

  public getColumnArrowUpwardSortingIcon(columnName: columnNameType) {
    // data-testid for this up arrow selector is also "ArrowDownwardIcon", which seems incorrect, so I use svg instead
    return this.page.locator(`[aria-label="Sorted by ${columnName} ascending"] svg`);
  }

  public async sortColumnDESC(columnName: columnNameType) {
    if (await this.getColumnDefaultSortingIcon(columnName).isVisible()) {
      await this.getColumnDefaultSortingIcon(columnName).click();
    }
    if (await this.getColumnArrowUpwardSortingIcon(columnName).isVisible()) {
      await this.getColumnArrowUpwardSortingIcon(columnName).click();
      await this.getColumnDefaultSortingIcon(columnName).click();
    }
  }

  public async sortColumnASC(columnName: columnNameType) {
    if (await this.getColumnDefaultSortingIcon(columnName).isVisible()) {
      await this.getColumnDefaultSortingIcon(columnName).click();
      await this.getColumnArrowDownwardSortingIcon(columnName).click();
    }
    if (await this.getColumnArrowDownwardSortingIcon(columnName).isVisible()) {
      await this.getColumnArrowDownwardSortingIcon(columnName).click();
    }
  }

  public getTableRow(rowNumber: number) {
    return this.page.locator('table tr.MuiTableRow-root').nth(rowNumber);
  }

  public getColumnHeader(columnName: columnNameType) {
    return this.page.locator('.MuiTableRow-root.MuiTableRow-head.ec-1t2xaz1').getByText(columnName, { exact: true });
  }

  public getTableCell(rowNumber: number, cellNumber: number) {
    return this.getTableRow(rowNumber).locator('td').nth(cellNumber);
  }

  public async expandShowOrHideColumnList() {
    await this.page.locator('[aria-label="Show/Hide columns"]').click();
  }

  public async toggleColumnVisibility(columnName: columnNameType) {
    await this.expandShowOrHideColumnList();
    await this.page
      .locator('span.MuiTypography-body1.MuiFormControlLabel-label')
      .getByText(`${columnName}`, { exact: true })
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

  public async filterByColumnName(columnName: columnNameType, phrase: string) {
    await this.showFiltersVisibility();
    await this.page.locator(`[title="Filter by ${columnName}"]`).fill(phrase);
  }
}
