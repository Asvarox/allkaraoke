import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class HistoryPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get container() {
    return this.page.getByTestId('history-page');
  }

  public get emptyState() {
    return this.page.getByTestId('history-empty-state');
  }

  public get entries() {
    return this.page.locator('[data-test^="history-entry-"]');
  }

  public async expectEntryCount(count: number) {
    await expect(this.entries).toHaveCount(count);
  }

  public async navigateToEntry(index: number) {
    // Move keyboard focus to this entry (0-based index from top)
    for (let i = 0; i < index; i++) {
      await this.page.keyboard.press('ArrowDown');
    }
  }

  public async expandFocusedEntry() {
    await this.page.keyboard.press('Enter');
  }

  public get expandedDetails() {
    return this.page.getByTestId('history-entry-details');
  }
}
