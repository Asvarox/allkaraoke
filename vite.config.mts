import { cloudflare } from '@cloudflare/vite-plugin';
import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import babel from '@rolldown/plugin-babel';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import * as process from 'process';
import { visualizer } from 'rollup-plugin-visualizer';
import { type ConfigEnv } from 'vite';
import { configDefaults, defineConfig } from 'vitest/config';
import { bundledIcons } from './scripts/vite-plugin-bundled-icons';
import { fakeSfu, hasRealtimeCredentials } from './scripts/vite-plugin-fake-sfu';
import routePaths from './src/routes/route-paths';
import { htmlPrerender } from './vite-plugin-html-prerender/src/index';

// HTTPS is opt-in (`pnpm start:https`). Plain `http://localhost` is already a secure context, so the
// Service Worker and getUserMedia work by default - HTTPS is only needed to reach the dev server from
// another device on the LAN (eg. a phone used as a remote mic). See readme.md.
const useHttps = !!process.env.HTTPS;
const certPath = './config/crt/server.pem';
const keyPath = './config/crt/server.key';
const customCert = fs.existsSync(certPath);

if (useHttps && !customCert) {
  console.log(
    'No custom cert found, the browser will warn about the certificate. Check config/crt/readme.md how to fix it',
  );
}

// Online mode needs a Cloudflare Realtime SFU, and a checkout has no Realtime app. So the Worker's
// Realtime calls are pointed at the fake SFU in tests/fake-sfu, with placeholder credentials, in two
// cases - never on a build that gets deployed:
// - the end-to-end suite (`E2E_FAKE_SFU_URL`: `pnpm start:e2e`, and CI's e2e build), which starts the
//   fake itself and keeps its Durable Object storage and dep cache apart from a regular `pnpm start`;
// - the dev server, when `.dev.vars` holds no Realtime credentials: the fake is started alongside it.
// The signaling rate limiter goes in both: every page of the suite, or every tab a developer opens to
// play against themselves, shares one local IP, far past the budget sized for one real browser.
const e2eFakeSfuUrl = process.env.E2E_FAKE_SFU_URL;
const DEV_FAKE_SFU_PORT = 3481;

const fakeSfuUrlFor = ({ command, isPreview }: ConfigEnv): string | undefined => {
  if (e2eFakeSfuUrl) return e2eFakeSfuUrl;
  if (command !== 'serve' || isPreview || process.env.VITEST || process.env.VITEST_WORKER_ID) return undefined;
  return hasRealtimeCredentials(__dirname) ? undefined : `http://127.0.0.1:${DEV_FAKE_SFU_PORT}/v1`;
};

const cloudflareOptionsFor = (fakeSfuUrl: string | undefined): Parameters<typeof cloudflare>[0] =>
  fakeSfuUrl
    ? {
        config: (config) => {
          config.vars = {
            ...config.vars,
            REALTIME_APP_ID: 'fake-sfu',
            REALTIME_APP_TOKEN: 'fake-sfu',
            REALTIME_API_URL: fakeSfuUrl,
          };
          // Mutated rather than returned: a returned array is concatenated onto the original.
          config.ratelimits = config.ratelimits?.filter(({ name }) => name !== 'REALTIME_SIGNALING_RATE_LIMITER');
        },
        // Runs next to a regular `pnpm start`; sharing its Durable Object storage would mix rooms.
        persistState: e2eFakeSfuUrl ? { path: '.wrangler/state-e2e' } : undefined,
      }
    : undefined;

/** The Cloudflare plugin, plus the fake SFU's process when the dev server has to run one. */
const cloudflarePlugins = (env: ConfigEnv) => {
  if (process.env.VITEST || process.env.VITEST_WORKER_ID) return [];
  const fakeSfuUrl = fakeSfuUrlFor(env);
  return [
    cloudflare(cloudflareOptionsFor(fakeSfuUrl)),
    fakeSfuUrl && !e2eFakeSfuUrl ? fakeSfu({ port: DEV_FAKE_SFU_PORT }) : null,
  ];
};

// https://vitejs.dev/config/
export default defineConfig((env) => ({
  // experimental: {
  // bundledDev: true,
  // },
  resolve: {
    tsconfigPaths: true, // Tells Vite to read paths from tsconfig.json
  },
  plugins: [
    ...cloudflarePlugins(env),
    bundledIcons({ namesFile: path.resolve(__dirname, 'src/modules/elements/akui/icon-names.ts') }),
    react({
      jsxImportSource: process.env.NODE_ENV === 'development' ? '@welldone-software/why-did-you-render' : undefined,
    }),
    babel({
      presets: [reactCompilerPreset()],
      plugins: [
        '@emotion/babel-plugin',
        // https://mui.com/material-ui/guides/minimizing-bundle-size/
        [
          'babel-plugin-transform-imports',
          {
            '@mui/icons-material': {
              transform: '@mui/icons-material/${member}',
              preventFullImport: true,
            },
            '@mui/material': {
              transform: '@mui/material/${member}',
              preventFullImport: true,
            },
          },
        ],
      ],
    }),
    visualizer(),
    useHttps && !customCert && basicSsl(),

    process.env.VITE_APP_PRERENDER
      ? htmlPrerender({
          staticDir: path.join(__dirname, 'build/client'),
          routes: Object.values(routePaths).map((route) => `/${route}`),
          minify: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            decodeEntities: true,
            keepClosingSlash: true,
            sortAttributes: true,
          },
        })
      : null,
  ],
  base: '/',
  // The same for the dep cache — two dev servers optimising into one directory trample each other.
  cacheDir: e2eFakeSfuUrl ? 'node_modules/.vite-e2e' : undefined,
  build: {
    outDir: 'build',
    sourcemap: !process.env.FAST_BUILD,
    reportCompressedSize: !process.env.FAST_BUILD,
  },
  server: {
    port: 3000,
    open: false,
    // HTTPS mode exists to reach the dev server from another device, so expose it on the LAN as well
    host: useHttps,
    ...(useHttps
      ? {
          https: {
            // Generated via https://letsencrypt.org/docs/certificates-for-localhost/#making-and-trusting-your-own-certificates
            key: fs.readFileSync(customCert ? keyPath : './config/crt/dummy.key'),
            cert: fs.readFileSync(customCert ? certPath : './config/crt/dummy.pem'),
          },
        }
      : {}),
  },
  preview: {
    open: false,
  },

  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          environment: 'happy-dom',
          name: 'app',
          setupFiles: 'src/setup-tests.ts',
          include: ['**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          exclude: [
            ...configDefaults.exclude,
            '**/*.browser.test.{ts,tsx}',
            'functions/**/*.test.ts',
            'worker/**/*.test.ts',
            '.claude/**/*',
          ],
        },
      },
      {
        extends: true,
        // Imported dynamically, so the optimizer only discovers it mid-run and reloads the page under the test
        optimizeDeps: { include: ['aubiojs'] },
        test: {
          name: 'browser',
          setupFiles: 'src/setup-tests.browser.ts',
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              launchOptions: {
                args: [
                  '--no-sandbox',
                  '--font-render-hinting=none', // https://github.com/microsoft/playwright/issues/20097
                  '--mute-audio',
                  '--allow-file-access-from-files',
                  '--use-fake-ui-for-media-stream',
                  '--use-fake-device-for-media-stream',
                  '--use-file-for-fake-audio-capture=tests/fixtures/test-440hz.wav',
                  ...(process.env.CI ? [] : ['--use-gl=egl']),
                ],
              },
            }),
            instances: [{ browser: 'chromium' }],
            locators: {
              testIdAttribute: 'data-test',
            },
            expect: {
              toMatchScreenshot: {
                // Keeps the layout the Playwright CT suite used: one shared root directory, split per test
                // file, and `-ci` references for the Linux CI container vs. per-platform ones locally
                resolveScreenshotPath: ({ arg, ext, root, testFileDirectory, testFileName }) =>
                  path.join(
                    root,
                    '__snapshots__',
                    path.relative('src', testFileDirectory),
                    testFileName,
                    `${arg}${process.env.CI ? '-ci' : `-${process.platform}`}${ext}`,
                  ),
              },
            },
          },
        },
      },
      {
        plugins: [
          cloudflareTest({
            main: './worker/index.ts',
            miniflare: {
              compatibilityDate: '2026-05-27',
              kvNamespaces: ['SHARED_SONGS_KV', 'LEADERBOARD_KV'],
              durableObjects: {
                LEADERBOARD_BOARD: { className: 'LeaderboardBoard', useSQLite: true },
                ONLINE_DIRECTORY: { className: 'OnlineDirectory', useSQLite: true },
                REMOTE_MIC_DIRECTORY: { className: 'RemoteMicDirectory', useSQLite: true },
              },
              bindings: {
                ADMIN_PANEL_PASSWORD: 'admin-password',
              },
            },
          }),
        ],
        test: {
          name: 'functions',
          include: ['functions/**/*.test.ts', 'worker/**/*.test.ts'],
          exclude: ['.claude/**/*'],
        },
      },
    ],
  },
}));
