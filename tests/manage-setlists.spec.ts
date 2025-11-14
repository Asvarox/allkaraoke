import { expect, test } from '@playwright/test';
import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test.describe('New user`s setlist', async () => {
  test('Adding and removing songs in setlist - works', async ({ page }) => {
    const setlistName = 'My setlist #1 - Allkaraoke';

    const songID = {
      num1: 'zzz-last-polish-1994',
      num2: 'e2e-single-english-1995',
      num3: 'e2e-croissant-french-1994',
    } as const;

    await test.step('Go to Manage Setlists Page', async () => {
      await page.goto('/?e2e-test');
      await pages.landingPage.enterTheGame();
      await pages.mainMenuPage.goToManageSongs();
      await pages.manageSongsPage.goToManageSetlists();
      await expect(pages.manageSetlists.setlistUserInfo).toBeVisible();
    });

    await test.step('Create new setlist - its details and setlist buttons should appear', async () => {
      await pages.manageSetlists.goToCreateNewSetlist(setlistName);
      await expect(pages.manageSetlists.getCreatedSetlistElement(setlistName)).toBeVisible();
      await pages.manageSetlists.expectSetlistSongCountToBe(setlistName, 0);
      await pages.manageSetlists.expectDefaultSetlistButtonsToBeVisible(setlistName);
      await pages.manageSetlists.expectSetlistEditModeStateToBe(setlistName, 'on');
    });

    await test.step('Go to edit setlist and select some songs - songs should be added to the setlist', async () => {
      await pages.manageSetlists.goToEditSetlist(setlistName);
      await pages.manageSetlists.addSongToSetlist(songID.num1);
      await pages.manageSetlists.addSongToSetlist(songID.num2);
      await pages.manageSetlists.addSongToSetlist(songID.num3);
      await pages.manageSetlists.expectSongToBeSelected(songID.num1);
      await pages.manageSetlists.expectSongToBeSelected(songID.num2);
      await pages.manageSetlists.expectSongToBeSelected(songID.num3);
      await pages.manageSetlists.expectSetlistSongCountToBe(setlistName, 3);
    });

    await test.step('After unselecting the song, it should be removed from the setlist', async () => {
      await pages.manageSetlists.removeSongFromSetlist(songID.num3);
      await pages.manageSetlists.expectSongToBeUnselected(songID.num3);
      await pages.manageSetlists.expectSetlistSongCountToBe(setlistName, 2);
    });
  });
});
