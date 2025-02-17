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

test('Sorting songs by last update', async ({ page }) => {
  const columnLastUpdate = 'Last Update';
  const lastUpdateColumnNum = 4;
  const lastUpdate1 = 'Jan 16 2023';
  const lastUpdate2 = 'Jan 15 2023';
  const lastUpdate3 = 'Aug 18 2022';

  await test.step('Go to Edit Song Page', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
  });

  await test.step('Check column with the last updates songs', async () => {
    await expect(pages.editSongsPage.getColumnHeader(columnLastUpdate)).toBeVisible();
    await expect(pages.editSongsPage.getTableCell(1, lastUpdateColumnNum)).toBeEmpty();
    await expect(pages.editSongsPage.getTableCell(2, lastUpdateColumnNum)).toBeEmpty();
    await expect(pages.editSongsPage.getTableCell(3, lastUpdateColumnNum)).toBeEmpty();
  });

  await test.step('Sort songs descending by last update', async () => {
    await expect(pages.editSongsPage.getTableCell(1, lastUpdateColumnNum)).toBeEmpty();
    await expect(pages.editSongsPage.getTableCell(2, lastUpdateColumnNum)).toBeEmpty();
    await expect(pages.editSongsPage.getTableCell(3, lastUpdateColumnNum)).toBeEmpty();
    await pages.editSongsPage.sortByLastUpdateDESC();
    await expect(pages.editSongsPage.lastUpdateArrowDownwardIcon).toBeVisible();
    await expect(pages.editSongsPage.getTableCell(1, lastUpdateColumnNum)).toContainText(lastUpdate1);
    await expect(pages.editSongsPage.getTableCell(2, lastUpdateColumnNum)).toContainText(lastUpdate2);
    await expect(pages.editSongsPage.getTableCell(3, lastUpdateColumnNum)).toContainText(lastUpdate3);
  });
});

test('Showing and hiding columns in table works, resets after refresh', async ({ page }) => {
  const columnID = 'ID';
  const columnArtist = 'Artist';
  const columnVideo = 'Video';

  await test.step('Go to Edit Song Page', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
  });

  await test.step('Only default song info columns should be visible', async () => {
    await expect(pages.editSongsPage.getColumnHeader(columnArtist)).toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader(columnID)).not.toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader(columnVideo)).not.toBeVisible();
  });

  await test.step('Enable song ID and video columns', async () => {
    await pages.editSongsPage.toggleColumnVisibility(columnID);
    await pages.editSongsPage.toggleColumnVisibility(columnVideo);
    await expect(pages.editSongsPage.getColumnHeader(columnID)).toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader(columnVideo)).toBeVisible();
  });

  await test.step('When hiding all columns, they become invisible', async () => {
    await pages.editSongsPage.hideAllColumns();
    await expect(pages.editSongsPage.getColumnHeader(columnArtist)).not.toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader(columnID)).not.toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader(columnVideo)).not.toBeVisible();
  });

  await test.step('After reloading the page, only default columns should be visible again', async () => {
    await page.reload();
    await expect(pages.editSongsPage.getColumnHeader(columnArtist)).toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader(columnID)).not.toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader(columnVideo)).not.toBeVisible();
  });
});

test('Filtering songs shows proper results', async ({ page }) => {
  const columnYear = 'Year';
  const yearColumnNum = 2;
  const year1 = '1990';
  const year2 = '1994';
  const year3 = '1994';
  const filteredYear = '1995';

  await test.step('Go to Edit Song Page', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
  });

  await test.step('Check column with songs release year', async () => {
    await expect(pages.editSongsPage.getColumnHeader(columnYear)).toBeVisible();
    await expect(pages.editSongsPage.getTableCell(1, yearColumnNum)).toHaveText(year1);
    await expect(pages.editSongsPage.getTableCell(2, yearColumnNum)).toHaveText(year2);
    await expect(pages.editSongsPage.getTableCell(3, yearColumnNum)).toHaveText(year3);
  });

  await test.step('Filtering by release year - only searched songs should be visible', async () => {
    await pages.editSongsPage.filterByColumnName(columnYear, filteredYear);
    await expect(pages.editSongsPage.getTableCell(1, yearColumnNum)).toHaveText(filteredYear);
    await expect(pages.editSongsPage.getTableCell(2, yearColumnNum)).toHaveText(filteredYear);
    await expect(pages.editSongsPage.getTableCell(3, yearColumnNum)).toHaveText(filteredYear);
  });
});
