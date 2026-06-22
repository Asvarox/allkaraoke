import { expect, Page } from '@playwright/test';

export class AdminUnverifiedSongsTablePO {
  constructor(private page: Page) {}

  private sortControl(label: string) {
    return this.page.locator(`[aria-label="${label}"]`).first();
  }

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

  public async rowsPerPageTagName() {
    return this.rowsPerPageSelect().evaluate((element) => element.tagName);
  }

  public async sortColumnDescending(name: string) {
    const defaultSortControl = this.sortControl(`Sort by ${name} descending`);
    const ascendingSortControl = this.sortControl(`Sorted by ${name} ascending`);
    const descendingSortControl = this.sortControl(`Sorted by ${name} descending`);

    if (await descendingSortControl.isVisible()) {
      return;
    }

    if (await defaultSortControl.isVisible()) {
      await defaultSortControl.click();
      return;
    }

    await ascendingSortControl.click();
  }

  public sortedDescendingControl(name: string) {
    return this.sortControl(`Sorted by ${name} descending`);
  }

  public async setRowsPerPage(pageSize: number) {
    if ((await this.rowsPerPageTagName()) === 'SELECT') {
      await this.rowsPerPageSelect().selectOption(String(pageSize));
      return;
    }

    await this.rowsPerPageSelect().click();
    await this.page.getByRole('option', { name: String(pageSize), exact: true }).click();
  }

  public async expectRowsPerPage(pageSize: number) {
    if ((await this.rowsPerPageTagName()) === 'SELECT') {
      await expect(this.rowsPerPageSelect()).toHaveValue(String(pageSize));
      return;
    }

    await expect(this.rowsPerPageSelect()).toContainText(String(pageSize));
  }

  public async expectSortedDescending(name: string) {
    await expect(this.sortedDescendingControl(name)).toBeVisible();
  }

  public async deleteSongBySharedSongId(sharedSongId: string) {
    await this.deleteButtonForSharedSongId(sharedSongId).click();
  }

  public async editSongBySharedSongId(sharedSongId: string) {
    await this.editButtonForSharedSongId(sharedSongId).click();
  }
}
