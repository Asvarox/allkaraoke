import { Decorator } from '@storybook/react-vite';

import { regularBackgroundGradient } from '~/modules/elements/layout-with-background';

/**
 * Paints the app's blue behind a screen story, as a still gradient like `StoryPage`. The animated one
 * app.tsx mounts is a viewport-sized `fixed` layer, which full-page screenshots lose below the fold.
 */
export const withAppBackground: Decorator = (Story) => (
  <div className="min-h-screen" style={{ backgroundImage: regularBackgroundGradient }}>
    <Story />
  </div>
);
