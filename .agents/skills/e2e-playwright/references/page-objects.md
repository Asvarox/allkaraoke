# Page Objects

## What They Are

Page Objects (PO) encapsulate Playwright interactions for a specific screen or component. They expose named methods and getters instead of raw selectors, making tests readable and maintainable.

Convention: class names end with `PO` (e.g. `SongListPagePO`, `GamePagePO`).

## Initialization

All Page Objects are created in one call at the top of each test file:

```ts
// tests/page-objects/initialise.ts
import initialise from './page-objects/initialise';

let pages: ReturnType<typeof initialise>;

test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  // ...
});
```

`initialise()` constructs every PO and returns them as a named object:

```ts
export default function initialise(page: Page, context: BrowserContext, browser: Browser) {
  return {
    landingPage: new LandingPagePO(page, context, browser),
    songListPage: new SongListPagePO(page, context, browser),
    gamePage: new GamePagePO(page, context, browser),
    // ...all other pages
  };
}
```

Tests access any page via `pages.pageName`, e.g.:

```ts
await pages.landingPage.enterTheGame();
await pages.songListPage.focusSong('e2e-single-english-1995');
```

## Structure of a Page Object Class

Every PO follows this constructor signature:

```ts
import { Browser, BrowserContext, Page } from '@playwright/test';

export class MyScreenPO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  // Getter — returns a Locator for use in assertions or chaining
  public get submitButton() {
    return this.page.getByTestId('submit-button');
  }

  // Action method — performs an interaction
  public async clickSubmit() {
    await this.submitButton.click();
  }

  // Assertion method — uses expect() internally
  public async expectToBeVisible() {
    await expect(this.page.getByTestId('my-screen')).toBeVisible();
  }
}
```

Selectors always use `page.getByTestId('data-test-value')`, which maps to `[data-test="..."]` in the HTML.

## Reusable Components

Some shared UI (e.g. a toolbar, dialog) is extracted into a `tests/components/` file and composed inside relevant POs:

```ts
// tests/components/Toolbar.ts
export class Toolbar {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}
  public async toggleHelp() { ... }
}

// A Page Object that includes the toolbar
export class MainMenuPagePO {
  toolbar = new Toolbar(this.page, this.context, this.browser);
  // Access in tests: pages.mainMenuPage.toolbar.toggleHelp()
}
```

Shared step functions live in `tests/steps/` (e.g. `navigateWithKeyboard.ts`, `openAndConnectRemoteMic.ts`) and are called from within PO methods.

## Location of Files

```
tests/
  page-objects/
    initialise.ts        ← creates all POs
    LandingPage.ts
    MainMenuPage.ts
    SongListPage.ts
    GamePage.ts
    ...                  ← one file per screen
    RemoteMic/           ← subfolder for remote mic screens
  components/
    Toolbar.ts
    Calibration.ts
    dialog.ts
    songs-table.ts
  steps/
    navigateWithKeyboard.ts
    openAndConnectRemoteMic.ts
    assertMonitoringStatus.ts
```

## Adding a New Page Object

1. Create `tests/page-objects/MyNewPage.ts` following the class structure above.
2. Import and add it to `tests/page-objects/initialise.ts`.
3. Access it in tests via `pages.myNewPage`.
