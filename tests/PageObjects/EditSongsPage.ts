import { Browser, BrowserContext, expect, Page } from '@playwright/test';

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

  public get lastUpdateDefaultIcon() {
    return this.page.locator('[aria-label="Sort by Last Update descending"] [data-testid="SyncAltIcon"]');
  }

  public get lastUpdateArrowDownwardIcon() {
    return this.page.locator('[aria-label="Sorted by Last Update descending"] [data-testid="ArrowDownwardIcon"]');
  }

  public get lastUpdateArrowUpwardIcon() {
    // data-testid for this up arrow selector is also "ArrowDownwardIcon", which seems incorrect, so I use svg instead
    return this.page.locator('[aria-label="Sorted by Last Update ascending"] svg');
  }

  public async sortByLastUpdateDESC() {
    if (await this.lastUpdateDefaultIcon.isVisible()) {
      await this.lastUpdateDefaultIcon.click();
    }
    if (await this.lastUpdateArrowUpwardIcon.isVisible()) {
      await this.lastUpdateArrowUpwardIcon.click();
      await this.lastUpdateDefaultIcon.click();
    }
  }

  public async sortByLastUpdateASC() {
    if (await this.lastUpdateDefaultIcon.isVisible()) {
      await this.lastUpdateDefaultIcon.click();
      await this.lastUpdateArrowDownwardIcon.click();
    }
    if (await this.lastUpdateArrowDownwardIcon.isVisible()) {
      await this.lastUpdateArrowDownwardIcon.click();
    }
  }

  public getTableRow(rowNumber: number) {
    return this.page.locator('table tr.MuiTableRow-root').nth(rowNumber);
  }

  public getColumnHeader(name: string) {
    return this.page.locator(`[title="${name}"]`);
  }

  public getTableCell(rowNumber: number, cellNumber: number) {
    return this.getTableRow(rowNumber).locator('td').nth(cellNumber);
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
}
