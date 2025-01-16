import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { Toolbar } from '../components/Toolbar';

export class Calibration {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  toolbar = new Toolbar(this.page, this.context, this.browser);

  public async expectInputLagToBe(value: string) {
    await expect(this.page.getByTestId('input-lag-value')).toHaveAttribute('data-value', value);
  }

  public get continueButton() {
    return this.page.getByTestId('continue');
  }

  public async goToCalibration() {
    await this.continueButton.click();
  }

  public get circleAnimationToSyncVideoAndSound() {
    return this.page.locator('.animate-calibrationPulse');
  }

  public get saveCalibrationButton() {
    return this.page.getByTestId('save');
  }

  public async clickToSaveCalibration() {
    await this.saveCalibrationButton.click();
  }

  public async approveDefaultCalibrationSetting() {
    await this.goToCalibration();
    await this.clickToSaveCalibration();
  }
}
