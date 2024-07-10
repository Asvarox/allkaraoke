import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class SettingsPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public async openRemoteMicSettings() {
    await this.page.getByTestId('remote-mics-settings').click();
  }

  public get defaultPermissionElement() {
    return this.page.getByTestId('default-permission');
  }

  public async toggleDefaultPermission() {
    await this.defaultPermissionElement.click();
  }

  public async expectDefaultPermissionToBeWrite() {
    await expect(this.defaultPermissionElement).toContainText('WRITE', { ignoreCase: true });
  }

  public async expectDefaultPermissionToBeRead() {
    await expect(this.defaultPermissionElement).toContainText('READ', { ignoreCase: true });
  }

  public async quickConnectPhone() {
    await this.page.getByTestId('quick-connect-phone').click();
  }

  public async closeQuickConnectPhone() {
    await this.page.getByTestId('quick-connect-close').click();
  }

  public get connectedDevicePermissionElement() {
    return this.page.getByTestId('remote-mic-entry');
  }

  public async toggleConnectedDevicePermission() {
    await this.connectedDevicePermissionElement.click();
  }

  public async expectConnectedDevicePermissionToBeRead() {
    await expect(this.connectedDevicePermissionElement).toContainText('READ', { ignoreCase: true });
  }

  public async expectConnectedDevicePermissionToBeWrite() {
    await expect(this.connectedDevicePermissionElement).toContainText('WRITE', { ignoreCase: true });
  }
}
