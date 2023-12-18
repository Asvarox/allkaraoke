import { expect, test } from '@playwright/test';
import { mockSongs, stubUserMedia } from './helpers';
import { openAndConnectRemoteMicWithCode } from './steps/openAndConnectRemoteMic';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await mockSongs({ page, context });
});

test('SingStar wireless mic is detected properly', async ({ page, context }) => {
  const { connectDevices, disconnectDevices } = await stubUserMedia({ page, context });

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await page.getByTestId('mics').click();
  await expect(page.getByTestId('advanced-tip')).toBeVisible();

  const nonSingstarDevice = {
    id: 'nonSingstarDevice',
    label: 'NonSSMic-2137',
    channels: 1,
  };
  const singstarDevice = {
    id: 'test',
    label: 'wireless mic #2137',
    channels: 2,
  };

  await connectDevices(nonSingstarDevice);
  await expect(page.getByTestId('list-change-info')).toBeVisible();

  await connectDevices(singstarDevice);

  await expect(page.getByTestId('setup-completed')).toBeVisible();
  await disconnectDevices(singstarDevice);
  await expect(page.getByTestId('setup-not-completed')).toBeVisible();
});

test('Default device is selected currently selected mic is disconnected', async ({ page, context }) => {
  const { connectDevices, disconnectDevices } = await stubUserMedia({ page, context });
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  const newDevice = {
    id: 'new-device',
    label: 'New device',
    channels: 1,
  };
  await connectDevices(newDevice);

  await page.getByTestId('advanced').click();

  await page.getByTestId('player-0-source').click();
  await page.getByTestId('player-0-input').click();
  await expect(page.getByTestId('player-0-input')).toContainText('New device', { ignoreCase: true });

  await disconnectDevices(newDevice);
  await expect(page.getByTestId('player-0-input')).toContainText('Default device', { ignoreCase: true });

  await connectDevices(newDevice);
  await expect(page.getByTestId('player-0-input')).toContainText('New device', { ignoreCase: true });
});
test('Properly labels multichannel devices', async ({ page, context }) => {
  const { connectDevices } = await stubUserMedia({ page, context });
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  const newDevice = {
    id: 'multichannel-device',
    label: 'Multichannel',
    channels: 2,
  };
  await connectDevices(newDevice);

  await page.getByTestId('advanced').click();

  await page.getByTestId('player-0-source').click();
  await page.getByTestId('player-0-input').click();
  await expect(page.getByTestId('player-0-input')).toContainText('Multichannel (ch 1)', { ignoreCase: true });
  await page.getByTestId('player-0-input').click();
  await expect(page.getByTestId('player-0-input')).toContainText('Multichannel (ch 2)', { ignoreCase: true });
});

test('Remote mic is deselected when it disconnects', async ({ page, context, browser }) => {
  await stubUserMedia({ page, context });
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await page.getByTestId('advanced').click();

  const remoteMic = await openAndConnectRemoteMicWithCode(page, browser, 'Remote Mic Test');

  await expect(page.getByTestId('player-0-source')).toContainText('Remote microphone', { ignoreCase: true });
  await expect(page.getByTestId('player-0-input')).toContainText('Remote Mic Test', { ignoreCase: true });

  await remoteMic.close();

  await expect(page.getByTestId('player-0-input')).toContainText('Default device', {
    ignoreCase: true,
    timeout: 10_000,
  });
});

test('Default microphone is selected for built-in', async ({ page, context }) => {
  const { connectDevices } = await stubUserMedia({ page, context });
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await connectDevices({
    id: 'not-related-device',
    label: 'Not related',
    channels: 1,
  });

  await page.getByTestId('built-in').click();

  await expect(page.getByTestId('selected-mic')).toContainText('Default device');
  // Select some different mic
  await page.getByTestId('back-button').click();
  await page.getByTestId('advanced').click();
  await page.getByTestId('player-0-input').click();
  await page.getByTestId('player-1-input').click();

  // Make sure it keeps the different mic
  await page.getByTestId('back-button').click();
  await page.getByTestId('built-in').click();
  await expect(page.getByTestId('selected-mic')).toContainText('Not related');
  await page.getByTestId('selected-mic').click();
  await expect(page.getByTestId('selected-mic')).toContainText('Default device');

  // Check if the initial setup doesn't show after refresh
  await page.getByTestId('save-button').click();

  await expect(page.getByTestId('sing-a-song')).toBeVisible();

  await page.reload();

  await expect(page.getByTestId('sing-a-song')).toBeVisible();
});
