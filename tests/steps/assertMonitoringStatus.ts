import { expect, Page } from '@playwright/test';
import type InputManager from 'Scenes/Game/Singing/Input/InputManager';

declare global {
  interface Window {
    __exposeSingletons: () => void;
    __singletons: {
      [singleton: string]: any;
      InputManager: typeof InputManager;
    };
  }
}

export async function getMonitoringStatus(page: Page) {
  return await page.evaluate(() => {
    window.__exposeSingletons();
    return window.__singletons.InputManager.monitoringStarted();
  });
}
export async function expectMonitoringToBeEnabled(page: Page) {
  await expect(
    await getMonitoringStatus(page),
    'Expected input monitoring to be enabled, it is disabled instead',
  ).toBeTruthy();
}
export async function expectMonitoringToBeDisabled(page: Page) {
  await expect(
    await getMonitoringStatus(page),
    'Expected input monitoring to be disabled, it is enabled instead',
  ).toBeTruthy();
}
