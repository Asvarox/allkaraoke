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
    await expect(pages.editSongsPage.getColumnHeader('Last Update')).toBeVisible();
    await expect(pages.editSongsPage.getTableCell(1, lastUpdateColumnNum)).toBeEmpty();
    await expect(pages.editSongsPage.getTableCell(2, lastUpdateColumnNum)).toBeEmpty();
    await expect(pages.editSongsPage.getTableCell(3, lastUpdateColumnNum)).toBeEmpty();
  });

  await test.step('Sort songs descending by last update', async () => {
    await expect(pages.editSongsPage.getTableCell(1, lastUpdateColumnNum)).toBeEmpty();
    await expect(pages.editSongsPage.getTableCell(2, lastUpdateColumnNum)).toBeEmpty();
    await expect(pages.editSongsPage.getTableCell(3, lastUpdateColumnNum)).toBeEmpty();
    await pages.editSongsPage.sortColumnDESC('Last Update');
    await expect(pages.editSongsPage.getColumnArrowDownwardSortingIcon('Last Update')).toBeVisible();
    await expect(pages.editSongsPage.getTableCell(1, lastUpdateColumnNum)).toContainText(lastUpdate1);
    await expect(pages.editSongsPage.getTableCell(2, lastUpdateColumnNum)).toContainText(lastUpdate2);
    await expect(pages.editSongsPage.getTableCell(3, lastUpdateColumnNum)).toContainText(lastUpdate3);
  });
});

test('Showing and hiding columns in table works, resets after refresh', async ({ page }) => {
  await test.step('Go to Edit Song Page', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
  });

  await test.step('Only default song info columns should be visible', async () => {
    await expect(pages.editSongsPage.getColumnHeader('Artist')).toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader('ID')).not.toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader('Video')).not.toBeVisible();
  });

  await test.step('Enable song ID and video columns', async () => {
    await pages.editSongsPage.toggleColumnVisibility('ID');
    await pages.editSongsPage.toggleColumnVisibility('Video');
    await expect(pages.editSongsPage.getColumnHeader('ID')).toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader('Video')).toBeVisible();
  });

  await test.step('When hiding all columns, they become invisible', async () => {
    await pages.editSongsPage.hideAllColumns();
    await expect(pages.editSongsPage.getColumnHeader('Artist')).not.toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader('ID')).not.toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader('Video')).not.toBeVisible();
  });

  await test.step('After reloading the page, only default columns should be visible again', async () => {
    await page.reload();
    await expect(pages.editSongsPage.getColumnHeader('Artist')).toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader('ID')).not.toBeVisible();
    await expect(pages.editSongsPage.getColumnHeader('Video')).not.toBeVisible();
  });
});

test('Filtering songs shows proper results', async ({ page }) => {
  const yearColumnNum = 2;
  const year1 = '1990';
  const year2 = '1994';
  const year3 = {
    year: '1994',
    songID: 'e2e-croissant-french-1994',
  } as const;

  const filteredYear = {
    year: '1995',
    songID: 'e2e-christmas-english-1995',
  } as const;

  await test.step('Go to Edit Song Page', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
  });

  await test.step('Check column with songs release year', async () => {
    await expect(pages.editSongsPage.getColumnHeader('Year')).toBeVisible();
    await expect(pages.editSongsPage.getTableCell(1, yearColumnNum)).toHaveText(year1);
    await expect(pages.editSongsPage.getTableCell(2, yearColumnNum)).toHaveText(year2);
    await expect(pages.editSongsPage.getTableCell(3, yearColumnNum)).toHaveText(year3.year);
  });

  await test.step('Filtering by release year - only searched songs should be visible', async () => {
    await pages.editSongsPage.filterByColumnName('Year', filteredYear.year);
    await expect(pages.editSongsPage.getTableCell(1, yearColumnNum)).toHaveText(filteredYear.year);
    await expect(pages.editSongsPage.getTableCell(2, yearColumnNum)).toHaveText(filteredYear.year);
    await expect(pages.editSongsPage.getTableCell(3, yearColumnNum)).toHaveText(filteredYear.year);
  });

  await test.step('Searching when filtering is enabled only works for filtered songs', async () => {
    await pages.editSongsPage.searchSongs(year3.songID);
    await expect(pages.editSongsPage.getSongElement(year3.songID)).not.toBeVisible();
    await expect(pages.editSongsPage.noSongResultsFoundElement).toBeVisible();

    await pages.editSongsPage.searchSongs(filteredYear.songID);
    await expect(pages.editSongsPage.getSongElement(filteredYear.songID)).toBeVisible();
  });
});
