import { expect, test } from '@playwright/test';
import { mockSongs, stubUserMedia } from './helpers';
import { openAndConnectRemoteMicWithCode } from './steps/openAndConnectRemoteMic';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await mockSongs({ page, context });
});

const blueMicNum = 0;
const micSourceName = 'Microphone';

test('SingStar wireless mic is detected properly', async ({ page, context }) => {
  const { connectDevices, disconnectDevices } = await stubUserMedia({ page, context });

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

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Go to Singstar mic', async () => {
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectMultipleMicrophones();
    await pages.inputSelectionPage.selectSingstarMicrophones();
    await expect(pages.singstarConnectionPage.detectionAdvancedTip).toBeVisible();
  });

  await test.step('Connect non-Singstar device', async () => {
    await connectDevices(nonSingstarDevice);
    await expect(pages.singstarConnectionPage.availableMicsListChangeInfo).toBeVisible();
  });

  await test.step('Connect singstar device', async () => {
    await connectDevices(singstarDevice);
    await expect(pages.singstarConnectionPage.setupConnectedAlert).toBeVisible();
  });

  await test.step('Disconnect singstar device', async () => {
    await disconnectDevices(singstarDevice);
    await expect(pages.singstarConnectionPage.setupNotConnectedAlert).toBeVisible();
  });
});

test('Selected device after reconnecting is selected again', async ({ page, context }) => {
  const { connectDevices, disconnectDevices } = await stubUserMedia({ page, context });

  const micSourceName = 'Microphone';
  const micName = 'New device';
  const micNameDef = 'Default device';

  const newDevice = {
    id: 'new-device',
    label: 'New device',
    channels: 1,
  };

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Connect new device and go to advanced setup', async () => {
    await connectDevices(newDevice);
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
  });

  await test.step('Toggle mic source and input name', async () => {
    await pages.advancedConnectionPage.togglePlayerMicrophoneSource(blueMicNum);
    await pages.advancedConnectionPage.expectPlayerMicSourceToBe(blueMicNum, micSourceName);

    await pages.advancedConnectionPage.toggleMicInputName(blueMicNum);
    await pages.advancedConnectionPage.expectMicInputNameToBe(blueMicNum, micName);
  });

  await test.step('New device is disconnected', async () => {
    await disconnectDevices(newDevice);
    await pages.advancedConnectionPage.expectPlayerMicSourceToBe(blueMicNum, micSourceName);
    await pages.advancedConnectionPage.expectMicInputNameToBe(blueMicNum, micNameDef);
  });

  await test.step('Reconnecting device', async () => {
    await connectDevices(newDevice);
    await pages.advancedConnectionPage.expectPlayerMicSourceToBe(blueMicNum, micSourceName);
    await pages.advancedConnectionPage.expectMicInputNameToBe(blueMicNum, micName);
  });
});

test('Properly labels multichannel devices', async ({ page, context }) => {
  const { connectDevices } = await stubUserMedia({ page, context });

  const micName1 = 'Multichannel (ch 1)';
  const micName2 = 'Multichannel (ch 2)';

  const newDevice = {
    id: 'multichannel-device',
    label: 'Multichannel',
    channels: 2,
  };

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Connect new device and go to advanced setup', async () => {
    await connectDevices(newDevice);
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
  });

  await test.step('Toggle mic source', async () => {
    await pages.advancedConnectionPage.togglePlayerMicrophoneSource(blueMicNum);
    await pages.advancedConnectionPage.expectPlayerMicSourceToBe(blueMicNum, micSourceName);
  });

  await test.step('Toggle mic input name', async () => {
    await pages.advancedConnectionPage.toggleMicInputName(blueMicNum);
    await pages.advancedConnectionPage.expectMicInputNameToBe(blueMicNum, micName1);

    await pages.advancedConnectionPage.toggleMicInputName(blueMicNum);
    await pages.advancedConnectionPage.expectMicInputNameToBe(blueMicNum, micName2);
  });
});

test('Remote mic is deselected when it disconnects', async ({ page, context, browser }) => {
  await stubUserMedia({ page, context });

  const micSourceName = 'Remote microphone';
  const playerName = 'Remote Mic Test';
  const playerNameDef = 'Default device';

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Select Advanced setup', async () => {
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
  });

  const remoteMicBlue = await openAndConnectRemoteMicWithCode(page, browser, playerName);

  await test.step('Check visibility of mic source and player1 name', async () => {
    await pages.advancedConnectionPage.expectPlayerMicSourceToBe(blueMicNum, micSourceName);
    await pages.advancedConnectionPage.expectPlayerNameToBe(blueMicNum, playerName);
  });

  await test.step('Close remote mic', async () => {
    await remoteMicBlue._page.close();
    await pages.advancedConnectionPage.expectPlayerNameToBe(blueMicNum, playerNameDef);
  });
});

test('Default microphone is selected for built-in', async ({ page, context, browserName }) => {
  const { connectDevices } = await stubUserMedia({ page, context });

  const micName = 'Not related';
  const micNameDef = 'Default device';

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await connectDevices({
    id: 'not-related-device',
    label: 'Not related',
    channels: 1,
  });

  await test.step('Go to computers mic and select mic input', async () => {
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectComputersMicrophone();
    await expect(pages.computersMicConnectionPage.micInputNameElement).toContainText(micNameDef);
  });

  await test.step('Go to advanced setup and toggle mic input', async () => {
    await pages.computersMicConnectionPage.goBackToInputSelection();
    await pages.inputSelectionPage.selectAdvancedSetup();
    await pages.advancedConnectionPage.expectMicInputNameToBe(blueMicNum, micNameDef);

    await pages.advancedConnectionPage.toggleMicInputName(blueMicNum);
    await pages.advancedConnectionPage.expectMicInputNameToBe(blueMicNum, micName);
  });

  await test.step('Go back to computer mic and toggle mic again', async () => {
    await pages.advancedConnectionPage.goBackToInputSelection();
    await pages.inputSelectionPage.selectComputersMicrophone();
    await expect(pages.computersMicConnectionPage.micInputNameElement).toContainText(micName);

    await pages.computersMicConnectionPage.toggleMicInputName();
    await expect(pages.computersMicConnectionPage.micInputNameElement).toContainText(micNameDef);
  });

  await test.step('Check if the initial setup does not show after reopen page', async () => {
    await pages.computersMicConnectionPage.goToMainMenu();
    await expect(pages.mainMenuPage.singSongButton).toBeVisible();

    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    test.fixme(browserName === 'firefox', 'Doesnt work on Firefox');
    await expect(pages.mainMenuPage.singSongButton).toBeVisible();
  });
});
