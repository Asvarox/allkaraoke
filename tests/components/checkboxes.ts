import { Browser, BrowserContext, expect, Locator, Page } from '@playwright/test';

export type checkboxesStateType = 'selected' | 'unselected';

export class Checkboxes {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
    private checkboxLocator: Locator,
  ) {}

  selectedCheckboxIDSelector = 'CheckBoxIcon';
  unselectedCheckboxIDSelector = 'CheckBoxOutlineBlankIcon';

  public get checkboxElement() {
    return this.checkboxLocator.locator('svg');
  }

  public async isCheckboxSelected() {
    return await this.checkboxLocator.locator(`svg[data-testid="${this.selectedCheckboxIDSelector}"]`).isVisible();
  }

  public async ensureCheckboxStateToBe(state: checkboxesStateType) {
    await expect(this.checkboxElement).toBeVisible();

    if (state === 'selected') {
      if (!(await this.isCheckboxSelected())) {
        await this.checkboxLocator.click();
      }
    }
    if (state === 'unselected') {
      if (await this.isCheckboxSelected()) {
        await this.checkboxLocator.click();
      }
    }
    await this.expectCheckboxStateToBe(state);
  }

  public async expectCheckboxStateToBe(state: checkboxesStateType) {
    if (state === 'selected') {
      await expect(this.checkboxElement).toHaveAttribute('data-testid', this.selectedCheckboxIDSelector);
    }
    if (state === 'unselected') {
      await expect(this.checkboxElement).toHaveAttribute('data-testid', this.unselectedCheckboxIDSelector);
    }
  }
}
