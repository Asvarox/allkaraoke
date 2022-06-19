import { defineConfig } from 'cypress';

export default defineConfig({
    blockHosts: ['*.g.doubleclick.net', '*.ingest.sentry.io'],
    chromeWebSecurity: false,
    retries: {
        runMode: 2,
        openMode: 0,
    },
    video: false,
    env: {
        'cypress-plugin-snapshots': {
            imageConfig: {
                threshold: 0.1,
            },
        },
    },
    e2e: {
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            return require('./cypress/plugins/index.js')(on, config);
        },
        excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
    },
});
