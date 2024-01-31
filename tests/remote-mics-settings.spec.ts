import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import { connectRemoteMic, openAndConnectRemoteMicDirectly } from './steps/openAndConnectRemoteMic';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('Should properly reset data settings', async ({ browser, page }) => {
  const name = 'E2E Test Blue';

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await page.getByTestId('remote-mics').click();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, name);

  await remoteMic.reload();

  await expect(remoteMic.getByTestId('player-name-input')).toHaveValue(name);

  await remoteMic.getByTestId('menu-settings').click();
  await remoteMic.getByTestId('microphone-settings').click();
  const remoteMicId = await remoteMic.getByTestId('remote-mic-id').textContent();

  await remoteMic.getByTestId('reset-microphone').click();
  await expect(remoteMic.getByTestId('player-name-input')).toHaveValue('');
  await remoteMic.getByTestId('menu-settings').click();
  await expect(remoteMic.getByTestId('remote-mic-id')).not.toContainText(remoteMicId!);
});

test('Should allow changing microphone input lag', async ({ browser, page, context }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await page.getByTestId('remote-mics').click();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await test.step('changing microphone lag is visible', async () => {
    await remoteMic.getByTestId('menu-settings').click();
    await remoteMic.getByTestId('microphone-settings').click();
    await remoteMic.getByTestId('microphone-delay').getByTestId('numeric-input-up').click();
    await expect(remoteMic.getByTestId('microphone-delay').getByTestId('numeric-input-value')).toContainText('25');
  });
  await test.step('the change is preserved after reload', async () => {
    await remoteMic.reload();
    await connectRemoteMic(remoteMic);
    await remoteMic.getByTestId('menu-settings').click();
    await remoteMic.getByTestId('microphone-settings').click();
    await expect(remoteMic.getByTestId('microphone-delay').getByTestId('numeric-input-value')).toContainText('25');
  });
});

test('Should properly manage mics', async ({ browser, page, context }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await page.getByTestId('remote-mics').click();

  const remoteMic1 = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');
  const remoteMic2 = await openAndConnectRemoteMicDirectly(page, browser, 'Player 2');
  await expect(remoteMic2.getByTestId('indicator')).toHaveAttribute('data-player-number', '1');

  await test.step('Changes other players number', async () => {
    await remoteMic1.getByTestId('menu-settings').click();
    await remoteMic1.getByTestId('manage-game').click();
    await remoteMic1.getByText('Player 2').click();
    await remoteMic1.getByTestId('change-to-unset').click();
    await expect(remoteMic2.getByTestId('indicator')).toHaveAttribute('data-player-number', 'none');
  });

  await test.step('Can still assign players after refresh', async () => {
    await remoteMic1.reload();
    await connectRemoteMic(remoteMic1);

    await remoteMic1.getByTestId('menu-settings').click();
    await remoteMic1.getByTestId('manage-game').click();
    await remoteMic1.getByText('Player 2').click();
    await remoteMic1.getByTestId('change-to-player-0').click();
    await expect(remoteMic2.getByTestId('indicator')).toHaveAttribute('data-player-number', '0');
    await remoteMic1.getByTestId('close-modal').click();
    await remoteMic1.getByTestId('menu-microphone').click();
    await expect(remoteMic1.getByTestId('indicator')).toHaveAttribute('data-player-number', 'none');
  });
});

test('Should allow changing game input lag', async ({ browser, page, context }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await page.getByTestId('remote-mics').click();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await page.getByTestId('save-button').click();
  await page.getByTestId('settings').click();

  await test.step('changing input lag is visible', async () => {
    await remoteMic.getByTestId('menu-settings').click();
    await remoteMic.getByTestId('manage-game').click();
    await remoteMic.getByTestId('game-input-lag').getByTestId('numeric-input-up').click();
    await expect(remoteMic.getByTestId('game-input-lag').getByTestId('numeric-input-value')).toContainText('50');
    await expect(page.getByTestId('input-lag')).toHaveValue('50');
  });
});
