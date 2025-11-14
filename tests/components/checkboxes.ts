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

  public async isCheckboxSelected() {
    const checkboxAttribute = await this.checkboxLocator.getAttribute('data-testid');
    return checkboxAttribute === this.selectedCheckboxIDSelector;
  }

  public async ensureCheckboxStateToBe(state: checkboxesStateType) {
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
  }

  public async expectCheckboxStateToBe(state: checkboxesStateType) {
    if (state === 'selected') {
      await expect(this.checkboxLocator).toHaveAttribute('data-testid', this.selectedCheckboxIDSelector);
    }
    if (state === 'unselected') {
      await expect(this.checkboxLocator).toHaveAttribute('data-testid', this.unselectedCheckboxIDSelector);
    }
  }
}
