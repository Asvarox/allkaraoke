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

const player1 = {
  name: 'E2E Test Blue',
  num: 0,
};

const player2 = {
  name: 'E2E Test Red',
  num: 1,
};

const player3 = {
  name: 'E2E Test Green',
  num: 2,
};

const player4 = {
  name: 'E2E Test Yellow',
  num: 3,
};

test('Remote mic should connect, be selectable and control the game', async ({ browser, page, browserName }) => {
  let remoteMic1: RemoteMicPages;
  let remoteMic2: RemoteMicPages;
  let remoteMic3: RemoteMicPages;
  let remoteMic4: RemoteMicPages;

  test.fixme(browserName === 'firefox', 'Test fails super often on FF');
  test.slow();

  await test.step('Go to select Smartphones setup', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectSmartphones();
  });

  await test.step('Connect remoteMics - entered names should be displayed properly and players should be assigned to mics', async () => {
    remoteMic1 = await openAndConnectRemoteMicWithCode(page, browser, player1.name);
    remoteMic2 = await openAndConnectRemoteMicDirectly(page, browser, player2.name);
    remoteMic3 = await openAndConnectRemoteMicDirectly(page, browser, player3.name);
    remoteMic4 = await openAndConnectRemoteMicDirectly(page, browser, player4.name);

    await pages.smartphonesConnectionPage.expectPlayerNameToBe(player1.num, player1.name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(player2.num, player2.name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(player3.num, player3.name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(player4.num, player4.name);

    await remoteMic1.remoteMicMainPage.expectPlayerToBeAssigned('blue');
    await remoteMic2.remoteMicMainPage.expectPlayerToBeAssigned('red');
    await remoteMic3.remoteMicMainPage.expectPlayerToBeAssigned('green');
    await remoteMic4.remoteMicMainPage.expectPlayerToBeAssigned('yellow');

    await remoteMic1.remoteMicMainPage.goToChangeMicColor();
    await remoteMic1.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('blue', 'You');
    await remoteMic1.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('red', player2.name);
    await remoteMic1.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('green', player3.name);
    await remoteMic1.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('yellow', player4.name);
  });

  await test.step('After unassigning, the player they should be unassigned from mic', async () => {
    await remoteMic1.remoteMicChangeMicColorPage.unassignOwnPlayer();
    await remoteMic1.remoteMicMainPage.expectPlayerToBeUnassigned();

    await remoteMic4.remoteMicMainPage.goToChangeMicColor();
    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('blue')).not.toBeVisible();
    await remoteMic4.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('red', player2.name);
    await remoteMic4.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('green', player3.name);
    await remoteMic4.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('yellow', 'You');
  });

  await test.step('After reconnecting - if previous mic is free, the player should be assigned to it again', async () => {
    await remoteMic1._page.reload();
    await remoteMic1.remoteMicMainPage.connect();
    await remoteMic1.remoteMicMainPage.expectPlayerToBeAssigned('blue');

    await remoteMic4.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('blue', player1.name);
    await remoteMic4.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('red', player2.name);
    await remoteMic4.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('green', player3.name);
    await remoteMic4.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('yellow', 'You');
  });

  await test.step('When player changes mic color, the new mic should be assigned instead of the old one', async () => {
    await remoteMic1.remoteMicMainPage.goToChangeMicColor();
    await remoteMic1.remoteMicChangeMicColorPage.setOrChangeMicAssignment('yellow');

    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('blue')).not.toBeVisible();
    await remoteMic4.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('red', player2.name);
    await remoteMic4.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('green', player3.name);
    await remoteMic4.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('yellow', player1.name);

    await expect(pages.smartphonesConnectionPage.getPlayerMicCheck(player1.num)).not.toBeVisible();
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(player4.num, player1.name);
  });

  await test.step('After unassigning and reconnecting - if previous mic is already taken, the player should be assigned to the red player', async () => {
    await remoteMic3.remoteMicMainPage.goToChangeMicColor();
    await remoteMic3.remoteMicChangeMicColorPage.unassignOwnPlayer();
    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('green')).not.toBeVisible();

    await remoteMic2.remoteMicMainPage.goToChangeMicColor();
    await remoteMic2.remoteMicChangeMicColorPage.setOrChangeMicAssignment('green');
    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('blue')).not.toBeVisible();
    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('red')).not.toBeVisible();

    await remoteMic3._page.reload();
    await remoteMic3.remoteMicMainPage.connect();
    await remoteMic3.remoteMicMainPage.expectPlayerToBeAssigned('red');

    await remoteMic4.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('red', player3.name);
    await expect(remoteMic4.remoteMicChangeMicColorPage.getMicAssignmentLocator('blue')).not.toBeVisible();
    await remoteMic4.remoteMicChangeMicColorPage.expectAnyPlayerToHaveMicAssigned('green', player2.name);

    await remoteMic1.remoteMicMainPage.expectPlayerToBeAssigned('yellow');
    await remoteMic2.remoteMicMainPage.expectPlayerToBeAssigned('green');
    await remoteMic3.remoteMicMainPage.expectPlayerToBeAssigned('red');
    await remoteMic4.remoteMicChangeMicColorPage.expectPlayerToBeUnassigned();
  });
});
