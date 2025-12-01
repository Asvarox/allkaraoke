import { Browser, BrowserContext, Page } from '@playwright/test';

export class Dialog {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public async enterMessageWhenDialogAppears(message: string) {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept(message);
    });
  }

  public async acceptWhenDialogAppears() {
    this.page.once('dialog', async (dialog) => {
      dialog.accept().catch();
    });
  }
}
