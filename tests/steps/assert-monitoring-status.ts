import { expect, Page } from '@playwright/test';

export async function getMonitoringStatus(page: Page) {
  return page.evaluate(() => {
    window.__exposeSingletons();
    return window.__singletons.InputManager.monitoringStarted();
  });
}
export async function expectMonitoringToBeEnabled(page: Page) {
  return expect(
    await getMonitoringStatus(page),
    'Expected input monitoring to be enabled, it is disabled instead',
  ).toBeTruthy();
}
export async function expectMonitoringToBeDisabled(page: Page) {
  return expect(
    await getMonitoringStatus(page),
    'Expected input monitoring to be disabled, it is enabled instead',
  ).toBeTruthy();
}
