import { Browser, BrowserContext, Page } from '@playwright/test';

export class RemoteToolbar {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}
}
