import { test } from '@playwright/test';
import { initTestMode, mockRandom, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
  await mockRandom({ page, context }, 0);
});

const date1 = '2023-01-15T10:35:39.918Z';
const date2 = '2023-01-07T15:55:39.918Z';
const date3 = '2022-08-18T17:12:59.918Z';

test('Sorting songs by last update works ', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.skipToMainMenu();
  await pages.mainMenuPage.goToManageSongs();
  await pages.manageSongsPage.goToEditSongs();
  await pages.editSongsPage.expectRowLastUpdateColumnToBeEmpty(1);
  await pages.editSongsPage.expectRowLastUpdateColumnToBeEmpty(2);
  await pages.editSongsPage.expectRowLastUpdateColumnToBeEmpty(3);

  await pages.editSongsPage.sortByLastUpdateDESC();
  await pages.editSongsPage.expectRowLastUpdateColumnToBe(1, date1);
  await pages.editSongsPage.expectRowLastUpdateColumnToBe(2, date2);
  await pages.editSongsPage.expectRowLastUpdateColumnToBe(3, date3);
});
