import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('History page', async ({ page }) => {
  await page.goto('/?e2e-test');

  await test.step('Navigate from main menu to History', async () => {
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToHistory();
    await expect(pages.historyPage.container).toBeVisible();
  });

  await test.step('Shows empty state when no songs have been sung', async () => {
    await expect(pages.historyPage.emptyState).toBeVisible();
  });

  await test.step('Back to menu via backspace', async () => {
    await page.keyboard.press('Backspace');
    await expect(pages.mainMenuPage.singSongButton).toBeVisible();
  });
});

test('History entry appears after a play is recorded', async ({ page }) => {
  await page.goto('/?e2e-test');

  await test.step('Load the app to ensure LocalForage is initialised', async () => {
    await pages.landingPage.enterTheGame();
  });

  await test.step('Seed a play entry directly into LocalForage', async () => {
    // Write a fake SongStats entry directly via IndexedDB to avoid playing a full song in the test.
    // The key 'e2e-single-english-1995' matches the mock song fixture ID used by getSongKey().
    await page.evaluate(async () => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('localforage');
        // Create the 'keyvaluepairs' store if the DB is being opened for the first time
        // (i.e. before LocalForage has initialised it by visiting the History page).
        // LocalForage checks objectStoreNames before creating, so this is safe even if it later
        // upgrades the DB version.
        request.onupgradeneeded = () => {
          request.result.createObjectStore('keyvaluepairs');
        };
        request.onsuccess = () => {
          const db = request.result;
          try {
            const transaction = db.transaction('keyvaluepairs', 'readwrite');
            transaction.objectStore('keyvaluepairs').put(
              {
                plays: 1,
                scores: [
                  {
                    setup: { id: 'test-id', players: [{ track: 0, number: 0 }], mode: 'DUEL', tolerance: 2 },
                    scores: [{ name: 'TestPlayer', score: 100000 }],
                    date: new Date().toISOString(),
                    progress: 1,
                  },
                ],
              },
              'e2e-single-english-1995',
            );
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error('IndexedDB transaction failed'));
          } catch (error) {
            reject(error);
          }
        };
        request.onerror = () => reject(new Error('Failed to open IndexedDB'));
      });
    });
  });

  await test.step('Navigate to History', async () => {
    await pages.mainMenuPage.goToHistory();
    await expect(pages.historyPage.container).toBeVisible();
  });

  await test.step('The play entry appears in the history', async () => {
    await pages.historyPage.expectEntryCount(1);
  });
});
