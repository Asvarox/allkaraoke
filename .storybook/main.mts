import { mergeConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {},
  async viteFinal(config) {
    return mergeConfig(config, {
      // @ts-expect-error for some reason the default import is not working
      plugins: [tsconfigPaths.default()],
    });
  },
};

export default config;
