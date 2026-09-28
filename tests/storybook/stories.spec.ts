import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { expect, test } from '@playwright/test';

import { stabilizePage, waitForIcons, withElementsHidden } from '../visual-regression/visual';

interface IndexEntry {
  id: string;
  title: string;
  name: string;
  type: 'story' | 'docs';
  tags?: string[];
}

interface ViewportOption {
  styles?: { width?: string; height?: string };
}

// What the spec gathers from Storybook's channel while the story renders
interface StoryRender {
  phases: string[];
  status?: 'success' | 'error';
}

// The subset of Storybook's preview runtime the capture reads, see `StoryRender` in storybook/preview
interface StorybookWindow {
  __storyRender?: StoryRender;
  __STORYBOOK_PREVIEW__?: {
    currentRender?: {
      story?: {
        parameters?: { viewport?: { defaultViewport?: string; options?: Record<string, ViewportOption> } };
        storyGlobals?: { viewport?: { value?: string } };
      };
    };
  };
}

/** Stories tagged with it are left out, e.g. ones that race a timer and can't be captured reliably. */
const SKIP_TAG = 'no-screenshot';

// Same as the `720p` viewport in .storybook/preview.tsx, used unless the story picks its own
const DEFAULT_VIEWPORT = { width: 1280, height: 720 };

const STATIC_DIR = 'storybook-static';
const INDEX_PATH = path.join(STATIC_DIR, 'index.json');
// Never reaches the network - every request to it is answered from STATIC_DIR, see below
const ORIGIN = 'http://storybook.test';

if (!existsSync(INDEX_PATH)) {
  throw new Error(`${INDEX_PATH} not found - run \`pnpm build-storybook\` first`);
}

const { entries } = JSON.parse(readFileSync(INDEX_PATH, 'utf8')) as { entries: Record<string, IndexEntry> };
const stories = Object.values(entries).filter((entry) => entry.type === 'story' && !entry.tags?.includes(SKIP_TAG));

for (const story of stories) {
  test(`${story.title} / ${story.name}`, async ({ page }) => {
    await stabilizePage(page);
    await page.addInitScript(() => {
      // Stories generating random data would otherwise render differently on every run
      Math.random = () => 0.2;

      // A throwing render or play function still ends `finished` with a `success` status - only an `errored`
      // phase on the way tells. The events can fire before any script listens, so hook the channel as it's made.
      const render: StoryRender = { phases: [] };
      (window as StorybookWindow).__storyRender = render;
      type Channel = { on: (event: string, listener: (payload: Record<string, never>) => void) => void };
      let channel: Channel | undefined;
      Object.defineProperty(window, '__STORYBOOK_ADDONS_CHANNEL__', {
        configurable: true,
        get: () => channel,
        set: (value: Channel) => {
          channel = value;
          value.on('storyRenderPhaseChanged', ({ newPhase }) => render.phases.push(newPhase));
          value.on('storyFinished', ({ status }) => (render.status = status));
        },
      });
    });
    // A plain file server, rather than a server process: `serve` redirects `iframe.html` to `/iframe`,
    // dropping the query string that says which story to render
    await page.route(`${ORIGIN}/**`, (route) => {
      const file = path.join(STATIC_DIR, decodeURIComponent(new URL(route.request().url()).pathname));

      return existsSync(file) && statSync(file).isFile()
        ? route.fulfill({ path: file })
        : route.fulfill({ status: 404 });
    });
    await page.setViewportSize(DEFAULT_VIEWPORT);

    await page.goto(`${ORIGIN}/iframe.html?id=${story.id}&viewMode=story`);

    // Waits for the render and the play function (if any) to finish
    await page.waitForFunction(() => (window as StorybookWindow).__storyRender?.status);
    const render = await page.evaluate(() => (window as StorybookWindow).__storyRender);
    expect(render?.phases, 'story threw while rendering or playing').not.toContain('errored');
    expect(render?.status, 'story reported a failure').toBe('success');

    // The viewport addon resizes the manager's iframe, which a direct iframe.html visit doesn't have
    const viewport = await page.evaluate(() => {
      const story = (window as StorybookWindow).__STORYBOOK_PREVIEW__?.currentRender?.story;
      const name = story?.storyGlobals?.viewport?.value ?? story?.parameters?.viewport?.defaultViewport;
      const styles = name ? story?.parameters?.viewport?.options?.[name]?.styles : undefined;
      const width = parseInt(styles?.width ?? '', 10);
      const height = parseInt(styles?.height ?? '', 10);

      return width && height ? { width, height } : null;
    });
    if (viewport) {
      await page.setViewportSize(viewport);
    }

    await page.evaluate(() => document.fonts.ready);
    await waitForIcons(page);

    await withElementsHidden(page, [], () =>
      expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true, maxDiffPixelRatio: 0.005 }),
    );
  });
}
