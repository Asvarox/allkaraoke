import { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', 'msw-storybook-addon'],
  // MSW's service worker only: kept out of the app's own public folder so it never ships with the game
  staticDirs: ['./public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {},
};

export default config;
