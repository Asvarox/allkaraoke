const { mergeConfig } = require('vite');
const tsconfigPaths = require('vite-tsconfig-paths').default;
const react = require('@vitejs/plugin-react').default;
module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {},
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      plugins: [tsconfigPaths()],
    });
  },
};
