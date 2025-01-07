import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { Toolbar } from '../components/Toolbar';

export class CalibrationPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  toolbar = new Toolbar(this.page, this.context, this.browser);

  public async expectInputLagToBe(value: string) {
    await expect(this.page.getByTestId('input-lag-value')).toHaveAttribute('data-value', value);
  }
}
