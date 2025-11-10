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
  test('Adding/removing songs and copying link to setlist - works', async ({ page }) => {
    const setlistName = 'My setlist #1 - Allkaraoke';

    const songs = {
      num1: {
        id: 'zzz-last-polish-1994',
        language: 'Polish',
      },
      num2: {
        id: 'e2e-single-english-1995',
        language: 'English',
      },
      num3: {
        id: 'e2e-pass-test-spanish-1994',
        language: 'Spanish',
      },
      num4: {
        id: 'e2e-cote-dazur-french-1994',
        language: 'French',
      },
    } as const;

    const setlistURL = {
      num1: '',
      num2: '',
    };

    await test.step('Go to Manage-Setlists Page', async () => {
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
      await pages.manageSetlists.addSongToSetlist(songs.num1.id);
      await pages.manageSetlists.addSongToSetlist(songs.num2.id);
      await pages.manageSetlists.addSongToSetlist(songs.num3.id);
      await pages.manageSetlists.addSongToSetlist(songs.num4.id);
      await pages.manageSetlists.expectSongStateToBe(songs.num1.id, 'selected');
      await pages.manageSetlists.expectSongStateToBe(songs.num2.id, 'selected');
      await pages.manageSetlists.expectSongStateToBe(songs.num3.id, 'selected');
      await pages.manageSetlists.expectSongStateToBe(songs.num4.id, 'selected');
      await pages.manageSetlists.expectSetlistSongCountToBe(setlistName, 4);
    });

    await test.step('After unselecting the song, it should be removed from the setlist', async () => {
      await pages.manageSetlists.removeSongFromSetlist(songs.num4.id);
      await pages.manageSetlists.expectSongStateToBe(songs.num4.id, 'unselected');
      await pages.manageSetlists.expectSetlistSongCountToBe(setlistName, 3);
    });

    await test.step('After copying link, url should be generated correctly and lead to setlist containing only selected songs', async () => {
      await pages.manageSetlists.clickToCopyLinkToSetlist(setlistName);
      setlistURL.num1 = await pages.manageSetlists.getSetlistURL(setlistName);

      await page.goto(setlistURL.num1);
      await pages.landingPage.enterTheGame();
      await pages.mainMenuPage.goToSingSong();
      await pages.songLanguagesPage.expectLanguageStateToBe(songs.num1.language, 'selected');
      await pages.songLanguagesPage.expectLanguageStateToBe(songs.num2.language, 'selected');
      await pages.songLanguagesPage.ensureLanguageStateToBe(songs.num3.language, 'selected');
      await expect(pages.songLanguagesPage.getLanguageCheckbox(songs.num4.language)).not.toBeVisible();

      await pages.songLanguagesPage.continueAndGoToSongList();
      await expect(await pages.songListPage.getSongElement(songs.num1.id)).toBeVisible();
      await expect(await pages.songListPage.getSongElement(songs.num2.id)).toBeVisible();
      await expect(await pages.songListPage.getSongElement(songs.num3.id)).toBeVisible();
      await expect(await pages.songListPage.getSongElement(songs.num4.id)).not.toBeVisible();
    });

    await test.step('1 - When setlist edit mode is on, user with link is able only to - remove/remove and restore - songs from the setlist', async () => {
      await pages.songListPage.goBackToMainMenu();
      await pages.mainMenuPage.goToManageSongs();
      await pages.manageSongsPage.goToManageSetlists();
      await pages.manageSetlists.goToEditSetlist(setlistName);
      await pages.manageSetlists.expectSetlistEditModeStateToBe(setlistName, 'on');
      await pages.manageSetlists.expectSongStateToBe(songs.num1.id, 'selected');
      await pages.manageSetlists.expectSongStateToBe(songs.num2.id, 'selected');
      await pages.manageSetlists.expectSongStateToBe(songs.num3.id, 'selected');
      await expect(pages.manageSetlists.getSongToggle(songs.num4.id)).not.toBeVisible();

      await pages.manageSetlists.removeSongFromSetlist(songs.num3.id);
      await pages.manageSetlists.expectSongStateToBe(songs.num3.id, 'unselected');
      await pages.manageSetlists.expectSetlistSongCountToBe(setlistName, 2);

      await pages.manageSetlists.addSongToSetlist(songs.num3.id);
      await pages.manageSetlists.expectSongStateToBe(songs.num3.id, 'selected');
      await pages.manageSetlists.expectSetlistSongCountToBe(setlistName, 3);
    });

    await test.step('2 - After modifying setlist, generated link should be different then before and removed song should be excluded', async () => {
      await pages.manageSetlists.removeSongFromSetlist(songs.num3.id);
      await pages.manageSetlists.expectSongStateToBe(songs.num3.id, 'unselected');

      await pages.manageSetlists.clickToCopyLinkToSetlist(setlistName);
      setlistURL.num2 = await pages.manageSetlists.getSetlistURL(setlistName);

      await expect(setlistURL.num1).not.toEqual(setlistURL.num2);

      await page.goto(setlistURL.num2);
      await pages.landingPage.enterTheGame();
      await pages.mainMenuPage.goToSingSong();
      await expect(await pages.songListPage.getSongElement(songs.num1.id)).toBeVisible();
      await expect(await pages.songListPage.getSongElement(songs.num2.id)).toBeVisible();
      await expect(await pages.songListPage.getSongElement(songs.num3.id)).not.toBeVisible();
      await expect(pages.songListPage.addSongIfMissingButton).toBeVisible();
    });

    await test.step('Only selected songs should be visible in Edit-Songs Page as well', async () => {
      await pages.songListPage.goBackToMainMenu();
      await pages.mainMenuPage.goToManageSongs();
      await pages.manageSongsPage.goToEditSongs();
      await expect(pages.editSongsPage.songsTable.getSongElement(songs.num1.id)).toBeVisible();
      await expect(pages.editSongsPage.songsTable.getSongElement(songs.num2.id)).toBeVisible();
      await expect(pages.editSongsPage.songsTable.getSongElement(songs.num3.id)).not.toBeVisible();
    });

    await test.step('When setlist edit mode is off, user has no access to Manage-Setlist and Edit-Songs Page', async () => {
      await pages.editSongsPage.goToMainMenu();
      await pages.mainMenuPage.goToManageSongs();
      await pages.manageSongsPage.goToManageSetlists();
      await pages.manageSetlists.clickToSetSetlistEditMode(setlistName, 'not editable');
      await pages.manageSetlists.expectSetlistEditModeStateToBe(setlistName, 'off');

      await pages.manageSetlists.copyAndOpenLinkToSetlist(setlistName);
      await pages.landingPage.enterTheGame();
      await pages.mainMenuPage.goToManageSongs();
      await expect(pages.manageSongsPage.manageSetlistsButton).not.toBeVisible();
      await expect(pages.manageSongsPage.editSongsButton).not.toBeVisible();

      await pages.manageSongsPage.goBackToMainMenu();
      await pages.mainMenuPage.goToSingSong();
      await expect(await pages.songListPage.getSongElement(songs.num1.id)).toBeVisible();
      await expect(await pages.songListPage.getSongElement(songs.num2.id)).toBeVisible();
      await expect(await pages.songListPage.getSongElement(songs.num3.id)).not.toBeVisible();
      await expect(pages.songListPage.addSongIfMissingButton).not.toBeVisible();
    });
  });
});
