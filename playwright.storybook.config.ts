import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * Screenshots every Storybook story from the static build (`pnpm build-storybook`), see
 * tests/storybook/stories.spec.ts. Separate from playwright.config.ts as it needs none of the app's
 * servers - the spec serves the built `storybook-static` directory itself.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests/storybook',
  // One flat directory named after the story ids, e.g. `components-button--primary-linux.png`
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}-{platform}{ext}',
  timeout: 120_000,
  expect: {
    // A full-page capture of a tall, effect-heavy gallery takes up to ~10s, and it needs two matching in a row
    timeout: 60_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: process.env.CI ? [['github'], ['blob']] : [['list'], ['html']],
  use: {
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    launchOptions: {
      args: [
        '--headless=new', // https://github.com/microsoft/playwright/issues/27598#issuecomment-1769220936
        '--no-sandbox',
        '--mute-audio',
        '--font-render-hinting=none', // https://github.com/microsoft/playwright/issues/20097
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};

export default config;
