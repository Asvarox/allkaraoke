import { expect, test } from '@playwright/test';
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

const columnID = 'ID';
const columnArtist = 'Artist';
const columnVideo = 'Video';

test('Showing and hiding columns in table works, resets after refresh', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.skipToMainMenu();
  await pages.mainMenuPage.goToManageSongs();
  await pages.manageSongsPage.goToEditSongs();
  await page.pause();
  await expect(pages.editSongsPage.getColumnHeader(columnArtist)).toBeVisible();
  await expect(pages.editSongsPage.getColumnHeader(columnID)).not.toBeVisible();
  await expect(pages.editSongsPage.getColumnHeader(columnVideo)).not.toBeVisible();

  await pages.editSongsPage.toggleColumnVisibility(columnID);
  await pages.editSongsPage.toggleColumnVisibility(columnVideo);
  await expect(pages.editSongsPage.getColumnHeader(columnID)).toBeVisible();
  await expect(pages.editSongsPage.getColumnHeader(columnVideo)).toBeVisible();

  await pages.editSongsPage.hideAllColumns();
  await expect(pages.editSongsPage.getColumnHeader(columnArtist)).not.toBeVisible();
  await expect(pages.editSongsPage.getColumnHeader(columnID)).not.toBeVisible();
  await expect(pages.editSongsPage.getColumnHeader(columnVideo)).not.toBeVisible();

  await page.reload();
  await expect(pages.editSongsPage.getColumnHeader(columnArtist)).toBeVisible();
  await expect(pages.editSongsPage.getColumnHeader(columnID)).not.toBeVisible();
  await expect(pages.editSongsPage.getColumnHeader(columnVideo)).not.toBeVisible();
});

const columnYear = 'Year';
const yearCell = 2;
const year1 = '1990';
const year2 = '1994';
const year3 = '1994';
const filteredYear = '1995';
test('Filtering songs shows proper results', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.skipToMainMenu();
  await pages.mainMenuPage.goToManageSongs();
  await pages.manageSongsPage.goToEditSongs();
  await expect(pages.editSongsPage.getColumnHeader(columnYear)).toBeVisible();
  await expect(pages.editSongsPage.getTableCellElement(1, yearCell)).toHaveText(year1);
  await expect(pages.editSongsPage.getTableCellElement(2, yearCell)).toHaveText(year2);
  await expect(pages.editSongsPage.getTableCellElement(3, yearCell)).toHaveText(year3);

  await pages.editSongsPage.filterByColumnName(columnYear, filteredYear);
  await expect(pages.editSongsPage.getTableCellElement(1, yearCell)).toHaveText(filteredYear);
  await expect(pages.editSongsPage.getTableCellElement(2, yearCell)).toHaveText(filteredYear);
  await expect(pages.editSongsPage.getTableCellElement(3, yearCell)).toHaveText(filteredYear);
});
