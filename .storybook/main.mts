import { mergeConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {},
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [tsconfigPaths()],
      build: {
        rollupOptions: {
          external: ['nano-css/addon/vcssom'],
        },
      },
    });
  },
};

export default config;
