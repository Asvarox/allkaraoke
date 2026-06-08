import { Page } from '@playwright/test';

export class AdminSharedSongsTablePO {
  constructor(private page: Page) {}

  public rowContaining(text: string) {
    return this.page.getByRole('row').filter({ hasText: text });
  }

  public rowWithTitle(title: string) {
    return this.page.getByRole('row').filter({ has: this.page.getByRole('cell', { name: title, exact: true }) });
  }

  public tableRow(rowNumber: number) {
    return this.page.getByRole('row').nth(rowNumber);
  }

  public columnHeader(name: string) {
    return this.page.getByRole('columnheader').filter({ hasText: name });
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

  public async deleteSongByExternalId(externalSongId: string) {
    await this.rowContaining(externalSongId)
      .getByLabel(/Delete/)
      .click();
  }

  public async editSongByExternalId(externalSongId: string) {
    await this.rowContaining(externalSongId).getByLabel(/Edit/).click();
  }
}
