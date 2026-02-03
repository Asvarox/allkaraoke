import type { Preview } from '@storybook/react-vite';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import '../src/index.css';

export const parameters: Preview = {
  parameters: {
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
