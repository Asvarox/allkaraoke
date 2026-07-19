import { cloudflare } from '@cloudflare/vite-plugin';
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import babel from '@rolldown/plugin-babel';
import { sentryVitePlugin } from '@sentry/vite-plugin';
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

// https://vitejs.dev/config/
export default defineConfig({
// experimental: {
// bundledDev: true,
// },
  resolve: {
    tsconfigPaths: true, // Tells Vite to read paths from tsconfig.json
  },
  plugins: [
    process.env.VITEST || process.env.VITEST_WORKER_ID ? null : cloudflare(),
    sentryVitePlugin({
      applicationKey: 'allkaraoke-party-sentry-key',
    }),
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
    environment: 'happy-dom',
    setupFiles: 'src/setup-tests.ts',
    projects: [
      {
        extends: true,
        test: {
          name: 'app',
          include: ['**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          exclude: [...configDefaults.exclude, 'functions/**/*.test.ts', '.claude/**/*'],
        },
      },
      {
        plugins: [
          cloudflareTest({
            main: './worker/index.ts',
            miniflare: {
              compatibilityDate: '2026-05-27',
              kvNamespaces: ['SHARED_SONGS_KV'],
              bindings: {
                ADMIN_PANEL_PASSWORD: 'admin-password',
              },
            },
          }),
        ],
        test: {
          name: 'functions',
          include: ['functions/**/*.test.ts'],
          exclude: ['.claude/**/*']
        },
      },
    ],
  },
});
