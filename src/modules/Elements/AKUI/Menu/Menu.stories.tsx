import { Meta, StoryFn } from '@storybook/react-vite';
import { ComponentProps } from 'react';
import { Menu } from '../Menu';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'AKUI/Menu',
  component: Menu,
} as Meta<ComponentProps<typeof Menu>>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<ComponentProps<typeof Menu>> = (args) => {
  return (
    <Menu {...args}>
      <Menu.Button>A button</Menu.Button>
      <Menu.Button disabled>A disabled button</Menu.Button>
      <Menu.Button focused>A focused button</Menu.Button>
      <Menu.Button disabled focused>
        A disabled focused button
      </Menu.Button>
    </Menu>
  );
};

export const MenuStory = Template.bind({});
