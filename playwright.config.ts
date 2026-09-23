import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

const prodRun = process.env.CI || process.env.PROD_RUN;

/**
 * Online mode's P2P rooms run against a fake Cloudflare Realtime SFU (tests/fake-sfu) — there is no
 * Realtime app to reach from here. The app's Worker is pointed at it by `E2E_FAKE_SFU_URL`, see
 * vite.config.mts; CI sets it on its build step, and the local servers below set it themselves.
 * 127.0.0.1 rather than localhost: in the CI container localhost can resolve to an address the fake
 * is not listening on.
 */
const FAKE_SFU_PORT = 3480;
const FAKE_SFU_URL = `http://127.0.0.1:${FAKE_SFU_PORT}/v1`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests',
  // Run by playwright.storybook.config.ts against the Storybook build instead
  testIgnore: 'storybook/**',
  /* Maximum time one test can run for. */
  timeout: 45_000,
  maxFailures: process.env.CI ? 3 : undefined,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 7000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0, // Retry with script that will rerun failed again on CI at the end
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 3 : 3,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['json', { outputFile: 'test-results.json' }],
    ...(process.env.CI ? ([['github'], ['blob']] as const) : ([['list'], ['html']] as const)),
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    locale: 'pl',
    testIdAttribute: 'data-test',
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 14_000,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // Not 3000: the suite's dev server runs in fake-SFU mode, so it must not be mistaken for (or
    // collide with) the `pnpm start` you develop against.
    baseURL: prodRun ? 'http://localhost:3010/?e2e-test' : 'http://localhost:3020/?e2e-test',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    launchOptions: {
      slowMo: 40,
      args: [
        // '--auto-open-devtools-for-tabs',
        '--headless=new', // https://github.com/microsoft/playwright/issues/27598#issuecomment-1769220936
        '--no-sandbox',
        '--mute-audio',
        '--allow-file-access-from-files',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--use-file-for-fake-audio-capture=tests/fixtures/test-440hz.wav',
        // Online mode's host liveness is a timer in a browser tab, and only the focused tab is
        // exempt from Chromium's background throttling — with several pages per spec (and three
        // shards competing on one CI runner) the guests' watchdogs would otherwise be clamped and
        // host succession would look like a hang.
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        !process.env.CI ? '--use-gl=egl' : '',
      ].filter((arg) => arg !== ''),
    },
    video: {
      mode: 'retain-on-failure',
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['microphone'],
      },
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: [
    prodRun
      ? {
          // On CI we check the same build as would be deployed - with the risk that some issues won't happen
          // locally. CI builds in its own step, so it only needs to serve the result. Both paths serve it with
          // `vite preview`, which runs the built Worker in the Workers runtime via @cloudflare/vite-plugin.
          //
          // Not `wrangler dev`: it fronts the Worker with a ProxyWorker whose fetch rejects with "Network
          // connection lost." whenever a request is aborted mid-flight - a browser page or context closing,
          // which the remote-mic specs do constantly. Wrangler treats that as fatal and exits, so the rest of
          // the shard fails with ERR_CONNECTION_REFUSED.
          command: process.env.CI
            ? 'vite preview --port 3010'
            : `E2E_FAKE_SFU_URL=${FAKE_SFU_URL} VITE_APP_PRERENDER=true vite build && vite preview --port 3010`,
          port: 3010,
          timeout: 60_000 * 3,
          reuseExistingServer: true,
        }
      : {
          // Keep one running with `pnpm start:e2e` to skip the startup on every run.
          command: 'pnpm start:e2e',
          port: 3020,
          timeout: 60_000 * 3,
          reuseExistingServer: true,
        },
    {
      command: 'node tests/fake-sfu/server.mts',
      env: { FAKE_SFU_PORT: String(FAKE_SFU_PORT) },
      port: FAKE_SFU_PORT,
      timeout: 30_000,
      reuseExistingServer: true,
    },
    {
      // The original online mode's room server (standalone PartyKit project, see partykit.json).
      // Still the default mode; P2P rooms need nothing here, they run against the Worker.
      command: 'pnpm exec partykit dev --port 1999',
      port: 1999,
      timeout: 60_000 * 3,
      reuseExistingServer: true,
    },
    // {
    //   command: 'pnpm peerjs',
    //   port: 3001,
    //   timeout: 60_000 * 3,
    //   reuseExistingServer: true,
    // },
  ].filter(Boolean) as PlaywrightTestConfig['webServer'],
};

export default config;
