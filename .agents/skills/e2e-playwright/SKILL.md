---
name: e2e-playwright
description: 'Run, write, and debug Playwright E2E tests for this project. Use when running a single test file or a single named test, writing new E2E tests, working with Page Objects, or mocking songs. Covers test setup, page object initialization, and song fixture mocking.'
argument-hint: 'Describe what you want to test or the test file/test name to run'
---

# E2E Playwright Testing

## When to Use

- Running or debugging a specific test file or named test
- Writing new E2E tests
- Understanding or extending Page Objects
- Setting up song mocking for tests

## Running Tests

Make sure you run just the tests you need for the job at hand. Running the entire suite can be time-consuming, especially if you only need to focus on one test file or a specific test.

### Run all E2E tests (against dev server)

```bash
pnpm e2e
```

### Run all E2E tests (against production build)

```bash
pnpm e2e:prod
```

### Run a single test **file**

```bash
pnpm e2e --project=chromium tests/sing-a-song.spec.ts
```

### Run a single **named test** within a file

Use `--grep` with a substring or regex matching the test name:

```bash
pnpm e2e --project=chromium --grep "Sing a song" tests/sing-a-song.spec.ts
```

Or to match a specific `test.step` description that is part of a test:

```bash
pnpm e2e --project=chromium --grep "Check preview of song1" tests/sing-a-song.spec.ts
```

### Run headed (visible browser window)

```bash
pnpm e2e --project=chromium --headed tests/sing-a-song.spec.ts
```

> **Note:** The dev server (`pnpm start`) must already be running on `https://localhost:3000` before running `pnpm e2e`. Use `pnpm e2e:prod` to build and test against a production build.

## Test File Anatomy

Every test file follows this pattern:

```ts
import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';

// All page objects for the test, set up before each test
let pages: ReturnType<typeof initialise>;

test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser); // Creates all PO instances
  await initTestMode({ page, context }); // Sets window.isE2ETests = true
  await mockSongs({ page, context }); // Intercepts song API routes with fixtures
});

test('My test name', async ({ page }) => {
  await page.goto('/?e2e-test');

  await test.step('Step description', async () => {
    await pages.landingPage.enterTheGame();
    // ...
  });
});
```

Key helpers from `tests/helpers.ts`:

- `initTestMode` — injects `window.isE2ETests = true` before page load
- `mockSongs` — intercepts `/songs/index.json` and individual song routes with fixture data
- `mockRandom` — overrides `Math.random` with a fixed value for deterministic tests
- `stubUserMedia` — mocks browser `navigator.mediaDevices` for microphone simulation

## Selectors

Selectors always use the `data-test` attribute (configured as `testIdAttribute` in `playwright.config.ts`):

```ts
await page.getByTestId('enter-the-game').click();
// equivalent to: await page.locator('[data-test="enter-the-game"]').click()
```

## Reference Docs

- [Page Object initialization and structure](./references/page-objects.md)
- [Song mocking with fixtures](./references/song-mocking.md)
