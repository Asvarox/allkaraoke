import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
// playwright.config.ts

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = defineConfig({
  // by default playwright adds platform (linux/windows etc.) to the snapshot path which is not needed
  snapshotPathTemplate: './__snapshots__/{testFilePath}/{arg}{ext}',
  testDir: './src/',
  testMatch: '*.spec.tsx',
  /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
  snapshotDir: './__snapshots__',
  /* Maximum time one test can run for. */
  timeout: 10 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    testIdAttribute: 'data-test',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Port to use for Playwright component endpoint. */
    ctPort: 3100,

    ctViteConfig: {
      mode: 'test',
      plugins: [
        react({
          babel: {
            plugins: ['@emotion'],
          },
        }),
        tsconfigPaths(),
      ],
      build: {
        sourcemap: false,
        reportCompressedSize: false,
      },
    },
    launchOptions: {
      args: [
        // "--auto-open-devtools-for-tabs",
        '--no-sandbox',
        '--font-render-hinting=none', // https://github.com/microsoft/playwright/issues/20097
        '--mute-audio',
        '--allow-file-access-from-files',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--use-file-for-fake-audio-capture=tests/fixtures/test-440hz.wav',
        !process.env.CI ? '--use-gl=egl' : '',
      ],
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});

export default config;
