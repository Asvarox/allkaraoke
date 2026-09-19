import { cloudflare } from '@cloudflare/vite-plugin';
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import babel from '@rolldown/plugin-babel';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import * as process from 'process';
import { visualizer } from 'rollup-plugin-visualizer';
import { configDefaults, defineConfig } from 'vitest/config';
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

// Set for the end-to-end suite only (`pnpm start:e2e`, and CI's e2e build): points the Worker's
// Realtime calls at the fake SFU in tests/fake-sfu, with placeholder credentials so P2P rooms take
// the SFU data plane rather than the relay. Never set on a build that gets deployed.
// The signaling rate limiter goes too: every page of the suite shares one local IP, far past the
// budget sized for one real browser.
const fakeSfuUrl = process.env.E2E_FAKE_SFU_URL;
const cloudflareOptions: Parameters<typeof cloudflare>[0] = fakeSfuUrl
  ? {
      config: (config) => {
        config.vars = {
          ...config.vars,
          REALTIME_APP_ID: 'e2e-fake-sfu',
          REALTIME_APP_TOKEN: 'e2e-fake-sfu',
          REALTIME_API_URL: fakeSfuUrl,
        };
        // Mutated rather than returned: a returned array is concatenated onto the original.
        config.ratelimits = config.ratelimits?.filter(({ name }) => name !== 'ONLINE_SIGNALING_RATE_LIMITER');
      },
      // Runs next to a regular `pnpm start`; sharing its Durable Object storage would mix rooms.
      persistState: { path: '.wrangler/state-e2e' },
    }
  : undefined;

// https://vitejs.dev/config/
export default defineConfig({
  // experimental: {
  // bundledDev: true,
  // },
  resolve: {
    tsconfigPaths: true, // Tells Vite to read paths from tsconfig.json
  },
  plugins: [
    process.env.VITEST || process.env.VITEST_WORKER_ID ? null : cloudflare(cloudflareOptions),
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
  cacheDir: fakeSfuUrl ? 'node_modules/.vite-e2e' : undefined,
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
    setupFiles: 'src/setup-tests.ts',
    projects: [
      {
        extends: true,
        test: {
          environment: 'happy-dom',
          name: 'app',
          include: ['**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          exclude: [...configDefaults.exclude, 'functions/**/*.test.ts', 'worker/**/*.test.ts', '.claude/**/*'],
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
});
