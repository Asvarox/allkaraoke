import { ArrowBack, ArrowForward, PlayArrow } from '@mui/icons-material';
import { Meta, StoryFn } from '@storybook/react-vite';
import { ComponentProps } from 'react';

import { Button, ButtonLink, ButtonSize } from './button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'AKUI/Button',
  component: Button,
} as Meta<ComponentProps<typeof Button>>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const ButtonStory: StoryFn<ComponentProps<typeof Button>> = (args) => {
  return (
    <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button {...args}>A button</Button>
        <Button {...args} disabled>
          A disabled button
        </Button>
        <Button {...args} data-focused>
          A focused button
        </Button>
        <Button {...args} disabled data-focused>
          A disabled focused button
        </Button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <ButtonLink>A button</ButtonLink>
        <ButtonLink disabled>A disabled button</ButtonLink>
        <ButtonLink data-focused>A focused button</ButtonLink>
        <ButtonLink disabled data-focused>
          A disabled focused button
        </ButtonLink>
      </div>
    </div>
  );
};

// A single icon still keeps the label centered: the opposite side reserves a matching gutter, so
// `leftIcon`-only and `rightIcon`-only buttons read as mirror images with the text in the middle.
export const WithIcons: StoryFn<ComponentProps<typeof Button>> = (args) => {
  return (
    <div style={{ display: 'flex', gap: 12, flexDirection: 'column', width: 320 }}>
      <Button {...args} rightIcon={<ArrowForward />}>
        Right icon
      </Button>
      <Button {...args} leftIcon={<ArrowBack />}>
        Left icon
      </Button>
      <Button {...args} leftIcon={<ArrowBack />} rightIcon={<ArrowForward />}>
        Both icons
      </Button>
      <Button {...args} rightIcon={<PlayArrow />}>
        Overridden icon
      </Button>
      <Button {...args} rightIcon={<ArrowForward />} disabled>
        Disabled with icon
      </Button>
    </div>
  );
};

// Icons scale with the button's `size`, so they stay proportional across every size.
export const IconSizes: StoryFn<ComponentProps<typeof Button>> = (args) => {
  const sizes: ButtonSize[] = ['mini', 'small', 'regular', 'large'];
  return (
    <div style={{ display: 'flex', gap: 12, flexDirection: 'column', width: 320 }}>
      {sizes.map((size) => (
        <Button {...args} key={size} size={size} leftIcon={<ArrowBack />} rightIcon={<ArrowForward />}>
          {size}
        </Button>
      ))}
    </div>
  );
};
