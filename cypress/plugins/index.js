/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.ts can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
const { initPlugin } = require('cypress-plugin-snapshots/plugin');
module.exports = (on, config) => {
    initPlugin(on, config);

    on('before:browser:launch', function (browser = {}, args) {
        if (browser.name === 'chrome') {
            console.log(args);
            args.push('--no-sandbox');
            args.push('--allow-file-access-from-files');
            args.push('--use-fake-ui-for-media-stream');
            args.push('--use-fake-device-for-media-stream');
            args.push('--use-file-for-fake-audio-capture=cypress/fixtures/test-440hz.wav');
        }

        return args;
    });

    on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium') {
            launchOptions.args.push('--no-sandbox');
            launchOptions.args.push('--allow-file-access-from-files');
            launchOptions.args.push('--use-fake-ui-for-media-stream');
            launchOptions.args.push('--use-fake-device-for-media-stream');
            launchOptions.args.push('--use-file-for-fake-audio-capture=cypress/fixtures/test-440hz.wav');
            launchOptions.args.push('--mute-audio');
        }
        return launchOptions;
    });
};
