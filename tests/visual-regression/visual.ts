import { Browser, BrowserContext, expect, Locator, Page, test } from '@playwright/test';

export const VIEWPORTS = {
  desktop: { width: 1600, height: 900 },
  tablet: { width: 768, height: 1024 },
  'mobile-portrait': { width: 390, height: 844 },
  'mobile-landscape': { width: 844, height: 390 },
} as const;

export type ViewportName = keyof typeof VIEWPORTS;

const ALL_VIEWPORTS = Object.keys(VIEWPORTS) as ViewportName[];

// Remote mic screens are only ever used on a phone, so they're captured on the two mobile viewports.
export const REMOTE_MIC_VIEWPORTS: ViewportName[] = ['mobile-portrait', 'mobile-landscape'];

export type MakeScreenshot = (
  name?: string,
  options?: {
    page?: Page;
    extraMasks?: Locator[];
    /** Capture just this element instead of the whole page, e.g. to frame a dialog. */
    locator?: Locator;
  },
) => Promise<void>;

type VisualTestFn = (args: {
  page: Page;
  context: BrowserContext;
  browser: Browser;
  viewport: { width: number; height: number };
  makeScreenshot: MakeScreenshot;
}) => Promise<void>;

const slugify = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const HIDDEN_ATTRIBUTE = 'data-visual-hidden';

/**
 * Volatile regions every screen shares. Kept as selectors rather than locators so the rule also
 * covers nodes that appear *after* the capture starts - the YouTube player, for one, swaps its own
 * iframe in asynchronously.
 */
const HIDDEN_SELECTORS = [
  // Embedded YouTube players (e.g. the song editor's "reference sound" step) load real,
  // ever-changing remote content - hide them rather than fighting that non-determinism.
  'iframe[src*="youtube"]',
  // Video playback is never at the same frame twice, and the native controls count the elapsed
  // time out loud on top of it.
  'video',
  // Only the bar inside the meter, not the element it fills: the bar redraws continuously from the
  // (fake) audio input via direct DOM mutation (so animation-disabling does nothing), while the box
  // around it - the remote mic's pill, a singer's row - is static and part of the screen's design.
  '[data-test="mic-volume-indicator"] > *',
  // Round-trip time to each singer in an online room, refreshed every second.
  '[data-test="participant-ping"]',
];

/**
 * Hides the given elements for the duration of `capture`.
 *
 * Playwright's own `mask` option doesn't hide anything - it paints an opaque pink box over the
 * finished screenshot at the element's position, so every baseline carries those boxes and anything
 * rendered *above* a masked element (a dialog over a volatile list) gets covered by them too.
 * Flipping the elements to `visibility: hidden` instead leaves the layout untouched and simply lets
 * whatever sits behind them show through, so the baseline is the real screen minus the volatile bits.
 */
const withElementsHidden = async (targetPage: Page, locators: Locator[], capture: () => Promise<void>) => {
  // Caller-supplied regions are locators, which can't be turned back into CSS - tag the elements
  // they currently resolve to and let the same rule pick the tag up.
  const elements = (await Promise.all(locators.map((locator) => locator.all()))).flat();

  const style = await targetPage.addStyleTag({
    content: `${[...HIDDEN_SELECTORS, `[${HIDDEN_ATTRIBUTE}]`].join(', ')} { visibility: hidden !important; }`,
  });

  try {
    await Promise.all(
      elements.map((element) =>
        element
          // A region that has gone since it was resolved is one less thing to hide, not a failure -
          // and tagging runs inside the `try` so that a rejection here still unwinds the rest.
          .evaluate((node, attribute) => node.setAttribute(attribute, ''), HIDDEN_ATTRIBUTE)
          .catch(() => {}),
      ),
    );

    await capture();
  } finally {
    await Promise.all(
      elements.map((element) =>
        element
          // The element may have been unmounted by the time the shot is done - nothing left to restore then.
          .evaluate((node, attribute) => node.removeAttribute(attribute), HIDDEN_ATTRIBUTE)
          .catch(() => {}),
      ),
    );
    await style.evaluate((node) => node.parentNode?.removeChild(node)).catch(() => {});
  }
};

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

        const makeScreenshot: MakeScreenshot = async (
          name,
          { page: targetPage = page, extraMasks = [], locator } = {},
        ) => {
          const fileName = name ? `${slug}-${name}-${viewportName}.png` : `${slug}-${viewportName}.png`;

          // Fixed-position elements (e.g. the top-right toolbar) are pinned at whatever scroll offset
          // is active when Playwright starts stitching a fullPage screenshot, so they render shifted
          // down if the page was left scrolled. Reset scroll first so they always land at the top.
          await targetPage.evaluate(() => window.scrollTo(0, 0));

          // `extraMasks` are the caller-supplied volatile regions, e.g. the remote mic's live ping
          // counter; HIDDEN_SELECTORS covers the ones every screen shares.
          await withElementsHidden(targetPage, extraMasks, async () => {
            await expect(locator ?? targetPage).toHaveScreenshot(fileName, {
              ...(locator ? {} : { fullPage: true }),
              // Covers antialiasing around text and a pixel of async layout drift, and nothing
              // larger. The old budget was twenty times this, to absorb the jitter of a painted mask
              // box that no longer exists.
              maxDiffPixelRatio: 0.005,
            });
          });
        };

        await testFn({ page, context, browser, viewport: VIEWPORTS[viewportName], makeScreenshot });
      });
    }
  });
}
