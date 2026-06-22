import { expect, Page } from '@playwright/test';

export class AdminUnverifiedSongsTablePO {
  constructor(private page: Page) {}

  public deleteButtonForSharedSongId(sharedSongId: string) {
    return this.page.locator(`[data-test="delete-unverified-song"][data-song="${sharedSongId}"]`);
  }

  public editButtonForSharedSongId(sharedSongId: string) {
    return this.page.locator(`[data-test="edit-unverified-song"][data-song="${sharedSongId}"]`);
  }

  public rowContaining(text: string) {
    return this.page.getByRole('row').filter({ hasText: text });
  }

  public rowWithTitle(title: string) {
    return this.page.getByRole('row').filter({ has: this.page.getByRole('cell', { name: title.trim(), exact: true }) });
  }

  public tableRow(rowNumber: number) {
    return this.page.getByRole('row').nth(rowNumber);
  }

  public columnHeader(name: string) {
    return this.page.getByRole('columnheader').filter({ hasText: name });
  }

  public rowsPerPageSelect() {
    return this.page.getByRole('combobox', { name: /rows per page/i });
  }

  public async sortColumnDescending(name: string) {
    const defaultSortIcon = this.page.locator(`[aria-label="Sort by ${name} descending"] [data-testid="SyncAltIcon"]`);
    const ascendingSortIcon = this.page.locator(`[aria-label="Sorted by ${name} ascending"] svg`);

    if (await defaultSortIcon.isVisible()) {
      await defaultSortIcon.click();
    }

    if (await ascendingSortIcon.isVisible()) {
      await ascendingSortIcon.click();
      await defaultSortIcon.click();
    }
  }

  public sortedDescendingIcon(name: string) {
    return this.page.locator(`[aria-label="Sorted by ${name} descending"] svg`);
  }

  public async setRowsPerPage(pageSize: number) {
    await this.rowsPerPageSelect().click();
    await this.page.getByRole('option', { name: String(pageSize), exact: true }).click();
  }

  public async expectRowsPerPage(pageSize: number) {
    await expect(this.rowsPerPageSelect()).toContainText(String(pageSize));
  }

  public async expectSortedDescending(name: string) {
    await expect(this.sortedDescendingIcon(name)).toBeVisible();
  }

  public async deleteSongBySharedSongId(sharedSongId: string) {
    await this.deleteButtonForSharedSongId(sharedSongId).click();
  }

  public async editSongBySharedSongId(sharedSongId: string) {
    await this.editButtonForSharedSongId(sharedSongId).click();
  }
}
