import { Browser, BrowserContext, Page } from '@playwright/test';
type columnNameType =
  | 'ID'
  | 'Artist'
  | 'Title'
  | 'Year'
  | 'Language'
  | 'Video'
  | 'Last Update'
  | 'Local'
  | 'Deleted'
  | 'Actions';

export class SongsTable {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public getSongIDSelector(songID: string) {
    return `[data-song="${songID}"]`;
  }

  public get searchInput() {
    return this.page.getByPlaceholder('Search');
  }

  public async searchSongs(songID: string) {
    await this.searchInput.fill(songID);
  }

  public get noSongResultsFoundElement() {
    return this.page
      .locator('tbody .MuiTypography-root.MuiTypography-body1')
      .getByText('No results found', { exact: true });
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
    return this.page.locator('.MuiTableRow-root.MuiTableRow-head').getByText(columnName, { exact: true });
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
