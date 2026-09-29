import type { PlaywrightTestConfig } from '@playwright/test';

import baseConfig from './playwright.config';

/**
 * Screenshots every Storybook story from the static build (`pnpm build-storybook`), see
 * tests/storybook/stories.spec.ts. Same browser setup as playwright.config.ts, minus the app's servers -
 * the spec serves the built `storybook-static` directory itself.
 */
const config: PlaywrightTestConfig = {
  ...baseConfig,
  testDir: './tests/storybook',
  testIgnore: undefined,
  // One flat directory named after the story ids, e.g. `components-button--primary-linux.png`
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}-{platform}{ext}',
  timeout: 120_000,
  expect: {
    ...baseConfig.expect,
    // A full-page capture of a tall, effect-heavy gallery takes up to ~10s, and it needs two matching in a row
    timeout: 60_000,
  },
  webServer: undefined,
};

export default config;
