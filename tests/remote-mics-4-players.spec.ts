import { test } from '@playwright/test';
import { initTestMode } from './helpers';
import { openAndConnectRemoteMicDirectly, openAndConnectRemoteMicWithCode } from './steps/openAndConnectRemoteMic';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  // await mockSongs({ page, context });
});

// Service worker caches index.json which breaks playwright's request intercept (mocking of song list)
// Not disabling it globally so in case SW breaks the app it is caught by other tests
test.use({ serviceWorkers: 'block' });

const P1_Name = 'E2E Test Blue';
const P2_Name = 'E2E Test Red';
const P3_Name = 'E2E Test Green';
const P4_Name = 'E2E Test Yellow';

test('Remote mic should connect, be selectable and control the game', async ({
  browser,
  page,
  context,
  browserName,
}) => {
  test.fixme(browserName === 'firefox', 'Test fails super often on FF');
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMicBluePage = await openAndConnectRemoteMicWithCode(page, browser, P1_Name);
  const remoteMicRed = await openAndConnectRemoteMicDirectly(page, browser, P2_Name);
  const remoteMicGreen = await openAndConnectRemoteMicDirectly(page, browser, P3_Name);
  const remoteMicYellow = await openAndConnectRemoteMicDirectly(page, browser, P4_Name);

  await page.pause();

  // Assert auto selection of inputs
  await pages.smartphonesConnectionPage.expectPlayerNameToBe(0, P1_Name);
  await pages.smartphonesConnectionPage.expectPlayerNameToBe(1, P2_Name);
  await pages.smartphonesConnectionPage.expectPlayerNameToBe(2, P3_Name);
  await pages.smartphonesConnectionPage.expectPlayerNameToBe(3, P4_Name);
});
