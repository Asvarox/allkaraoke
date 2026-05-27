import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html']],
  use: {
    locale: 'pl',
    testIdAttribute: 'data-test',
    actionTimeout: 14_000,
    baseURL: 'http://127.0.0.1:8788',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    launchOptions: {
      slowMo: 40,
      args: [
        '--headless=new',
        '--no-sandbox',
        '--mute-audio',
        '--allow-file-access-from-files',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--use-file-for-fake-audio-capture=tests/fixtures/test-440hz.wav',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['microphone'],
      },
    },
  ],
  webServer: [
    {
      command: 'pnpm build && wrangler pages dev build --port 8788 --local',
      port: 8788,
      timeout: 60_000 * 5,
      reuseExistingServer: true,
    },
    {
      command: 'pnpm peerjs',
      port: 3001,
      timeout: 60_000 * 3,
      reuseExistingServer: true,
    },
  ],
};

export default config;
