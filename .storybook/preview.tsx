import type { Preview } from '@storybook/react-vite';
import isChromatic from 'chromatic/isChromatic';
import { configure } from 'storybook/test';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';

import '../src/index.css';

configure({ testIdAttribute: 'data-test' });

if (isChromatic()) {
  Math.random = () => 0.2;
}

export const parameters: Preview = {
  parameters: {
    options: {
      // Alphabetical would put Components first. Read the system in the order it is built instead:
      // the tokens, then the kit made from them, then the screens the kit assembles into.
      storySort: { order: ['Foundations', 'Components', 'Game'] },
    },
    viewport: {
      options: {
        ...MINIMAL_VIEWPORTS,
        '720p': {
          name: '720p',
          styles: {
            width: '1280px',
            height: '720px',
          },
          type: 'desktop',
        },
        '1080p': {
          name: '1080p',
          styles: {
            width: '1920px',
            height: '1080px',
          },
          type: 'desktop',
        },
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <>
          <Story />
        </>
      );
    },
  ],
};

export default parameters;
