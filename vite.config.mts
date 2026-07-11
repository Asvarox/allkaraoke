import { cloudflare } from '@cloudflare/vite-plugin';
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import ReactCompilerBabelPlugin from 'babel-plugin-react-compiler';
import fs from 'node:fs';
import path from 'node:path';
import * as process from 'process';
import { visualizer } from 'rollup-plugin-visualizer';
import { configDefaults, defineConfig } from 'vitest/config';
import routePaths from './src/routes/route-paths';
import { htmlPrerender } from './vite-plugin-html-prerender/src/index';

const certPath = './config/crt/server.pem';
const keyPath = './config/crt/server.key';
const customCert = fs.existsSync(certPath);

if (!customCert) {
  console.log('No custom cert found, Service Worker might not work. Check README.md how to fix it');
}

// https://vitejs.dev/config/
export default defineConfig({
  //   experimental: {
  //     bundledDev: true,
  //   },
  resolve: {
    tsconfigPaths: true, // Tells Vite to read paths from tsconfig.json
  },
  plugins: [
    process.env.VITEST || process.env.VITEST_WORKER_ID ? null : cloudflare(),
    sentryVitePlugin({
      applicationKey: 'allkaraoke-party-sentry-key',
    }),
    ReactCompilerBabelPlugin,
    react({
      babel: {
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
      },
      jsxImportSource: process.env.NODE_ENV === 'development' ? '@welldone-software/why-did-you-render' : undefined,
    }),
    visualizer(),
    !customCert && basicSsl(),

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
    https: {
      // Generated via https://letsencrypt.org/docs/certificates-for-localhost/#making-and-trusting-your-own-certificates
      key: fs.readFileSync(customCert ? keyPath : './config/crt/dummy.key'),
      cert: fs.readFileSync(customCert ? certPath : './config/crt/dummy.pem'),
    },
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
