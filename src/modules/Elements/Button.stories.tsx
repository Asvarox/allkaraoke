import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { Button, LinkButton } from './Button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Legacy/Button',
  component: Button,
} as Meta<ComponentProps<typeof Button>>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<ComponentProps<typeof Button>> = (args) => {
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
        <LinkButton>A button</LinkButton>
        <LinkButton disabled>A disabled button</LinkButton>
        <LinkButton data-focused>A focused button</LinkButton>
        <LinkButton disabled data-focused>
          A disabled focused button
        </LinkButton>
      </div>
    </div>
  );
};

export const ButtonStory = Template.bind({});
