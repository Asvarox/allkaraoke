import { Browser, BrowserContext, Page } from '@playwright/test';

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
    return this.page.getByTestId('history-entry');
  }

  public async expectEntryCount(count: number) {
    await this.entries.nth(count - 1).waitFor();
    const actual = await this.entries.count();
    if (actual !== count) throw new Error(`Expected ${count} entries, got ${actual}`);
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
