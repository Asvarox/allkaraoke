import { Meta, StoryFn } from '@storybook/react-vite';
import { ComponentProps } from 'react';
import { Button, ButtonLink } from './Button';

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
