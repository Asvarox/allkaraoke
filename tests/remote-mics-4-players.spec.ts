import { expect, test } from '@playwright/test';
import { initTestMode } from './helpers';
import { openAndConnectRemoteMicDirectly, openAndConnectRemoteMicWithCode } from './steps/openAndConnectRemoteMic';

import initialise from './PageObjects/initialise';
import { RemoteMicPages } from './PageObjects/RemoteMic/initialiseRemoteMic';

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

let remoteMic1: RemoteMicPages;
let remoteMic2: RemoteMicPages;
let remoteMic3: RemoteMicPages;
let remoteMic4: RemoteMicPages;

test('Remote mic should connect, be selectable and control the game', async ({ browser, page, browserName }) => {
  test.fixme(browserName === 'firefox', 'Test fails super often on FF');
  test.slow();

  await test.step('Go to select Smartphones setup', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectSmartphones();
  });

  await test.step('Connect remoteMics - after entering players names, they should be displayed properly', async () => {
    remoteMic1 = await openAndConnectRemoteMicWithCode(page, browser, P1_Name);
    remoteMic2 = await openAndConnectRemoteMicDirectly(page, browser, P2_Name);
    remoteMic3 = await openAndConnectRemoteMicDirectly(page, browser, P3_Name);
    remoteMic4 = await openAndConnectRemoteMicDirectly(page, browser, P4_Name);

    await pages.smartphonesConnectionPage.expectPlayerNameToBe(0, P1_Name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(1, P2_Name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(2, P3_Name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(3, P4_Name);

    await remoteMic1.remoteMicMainPage.expectPlayerToBeAssigned('blue');
    await remoteMic2.remoteMicMainPage.expectPlayerToBeAssigned('red');
    await remoteMic3.remoteMicMainPage.expectPlayerToBeAssigned('green');
    await remoteMic4.remoteMicMainPage.expectPlayerToBeAssigned('yellow');

    await remoteMic1.remoteMicMainPage.goToChangeMicColor();
    await remoteMic1.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('blue', 'You');
    await remoteMic1.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('red', P2_Name);
    await remoteMic1.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('green', P3_Name);
    await remoteMic1.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('yellow', P4_Name);
  });

  await test.step('After removing player, they should be unassigned from mic', async () => {
    await remoteMic1.remoteMicChangeMicColorPage.removeOwnPlayer();
    await remoteMic1.remoteMicMainPage.expectPlayerToBeDisconnected();

    await remoteMic4.remoteMicMainPage.goToChangeMicColor();
    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('blue')).not.toBeVisible();
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('red', P2_Name);
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('green', P3_Name);
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('yellow', 'You');
  });

  await test.step('After reconnecting - if previous mic is free, the player should be assigned to it', async () => {
    await remoteMic1._page.reload();
    await remoteMic1.remoteMicMainPage.connect();
    await remoteMic1.remoteMicMainPage.expectPlayerToBeAssigned('blue');
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('blue', P1_Name);
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('red', P2_Name);
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('green', P3_Name);
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('yellow', 'You');
  });

  await test.step('When player changes mic color, the new mic should be assigned instead of the old one', async () => {
    await remoteMic1.remoteMicMainPage.goToChangeMicColor();
    await remoteMic1.remoteMicChangeMicColorPage.setOrChangeMicAssignment('yellow');
    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('blue')).not.toBeVisible();
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('red', P2_Name);
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('green', P3_Name);
    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('yellow')).not.toHaveText(P4_Name);
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('yellow', P1_Name);

    await expect(pages.smartphonesConnectionPage.getPlayerMicCheck(0)).not.toBeVisible();
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(3, P1_Name);
  });

  await test.step('After removing and reconnecting - if previous mic is already taken, the player should be assigned to the first in queue', async () => {
    await remoteMic3.remoteMicMainPage.goToChangeMicColor();
    await remoteMic3.remoteMicChangeMicColorPage.removeOwnPlayer();
    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('green')).not.toBeVisible();
    await remoteMic2.remoteMicMainPage.goToChangeMicColor();
    await remoteMic2.remoteMicChangeMicColorPage.setOrChangeMicAssignment('green');
    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('blue')).not.toBeVisible();
    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('red')).not.toBeVisible();

    await remoteMic3._page.reload();
    await remoteMic3.remoteMicMainPage.connect();
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('blue', P3_Name);
    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('red')).not.toBeVisible();
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('green', P2_Name);
    await remoteMic3.remoteMicMainPage.goToChangeMicColor();
    await remoteMic3.remoteMicChangeMicColorPage.expectPlayerToHaveMicAssigned('yellow', P1_Name);
  });
});
