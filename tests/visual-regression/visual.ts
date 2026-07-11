import { Browser, BrowserContext, expect, Page, test } from '@playwright/test';

export const VIEWPORTS = {
  desktop: { width: 1600, height: 900 },
  tablet: { width: 768, height: 1024 },
  'mobile-portrait': { width: 390, height: 844 },
  'mobile-landscape': { width: 844, height: 390 },
} as const;

export type ViewportName = keyof typeof VIEWPORTS;

const ALL_VIEWPORTS = Object.keys(VIEWPORTS) as ViewportName[];

export type MakeScreenshot = (name?: string) => Promise<void>;

type VisualTestFn = (args: {
  page: Page;
  context: BrowserContext;
  browser: Browser;
  makeScreenshot: MakeScreenshot;
}) => Promise<void>;

const slugify = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * Registers one test per viewport, tagged `@visual`.
 * Defaults to all viewports (desktop, tablet, mobile-portrait, mobile-landscape) unless a subset is given.
 * `testFn` should navigate/click through the screens it wants to capture, calling `makeScreenshot(name)`
 * whenever the page is ready to be captured (name is optional for single-screen tests).
 */
export function visual(title: string, testFn: VisualTestFn): void;
export function visual(title: string, viewports: ViewportName[], testFn: VisualTestFn): void;
export function visual(title: string, viewportsOrFn: ViewportName[] | VisualTestFn, maybeFn?: VisualTestFn) {
  const testFn = typeof viewportsOrFn === 'function' ? viewportsOrFn : maybeFn!;
  const viewportNames = Array.isArray(viewportsOrFn) ? viewportsOrFn : ALL_VIEWPORTS;
  const slug = slugify(title);

  test.describe(title, { tag: '@visual' }, () => {
    for (const viewportName of viewportNames) {
      test(`looks correct on ${viewportName}`, async ({ page, context, browser, browserName }) => {
        // Font rendering differs slightly between browsers, only Chromium is used to keep the baselines stable
        test.skip(browserName === 'firefox');

        await page.setViewportSize(VIEWPORTS[viewportName]);

        // Song cards show a real YouTube thumbnail (i3.ytimg.com); serving a fixed local image instead
        // keeps screenshots deterministic and independent of real network/CDN timing.
        await page.route('https://i3.ytimg.com/**', (route) =>
          route.fulfill({ path: 'src/routes/landing-page/screenshot1.webp' }),
        );

        // Some screens animate between states via the View Transitions API, which isn't reliably frozen
        // by Playwright's animation-disabling and can be caught mid-transition. The app's own transition
        // helper already falls back to an instant state change when the API is unsupported, so removing
        // it here (a real, already-exercised code path on browsers without the API) sidesteps the timing
        // entirely instead of guessing at wait times.
        await page.addInitScript(() => {
          Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true });
        });

        const makeScreenshot: MakeScreenshot = async (name) => {
          const fileName = name ? `${slug}-${name}-${viewportName}.png` : `${slug}-${viewportName}.png`;
          await expect(page).toHaveScreenshot(fileName, {
            fullPage: true,
            mask: [
              // Embedded YouTube players (e.g. the song editor's "reference sound" step) load real,
              // ever-changing remote content - mask them rather than fighting that non-determinism.
              page.locator('iframe[src*="youtube"]'),
              // Live microphone level meters redraw continuously from the (fake) audio input in real
              // time via direct DOM mutation, so CSS animation-disabling has no effect on them.
              page.locator('[data-test="mic-volume-indicator"]'),
            ],
            // A masked iframe's own async layout can shift the mask box by a pixel or two - tolerate that jitter
            maxDiffPixelRatio: 0.02,
          });
        };

        await testFn({ page, context, browser, makeScreenshot });
      });
    }
  });
}
