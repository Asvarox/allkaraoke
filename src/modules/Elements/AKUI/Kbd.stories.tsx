import { Meta, StoryFn } from '@storybook/react-vite';
import { ComponentProps } from 'react';
import { Kbd } from './Kbd';
import Typography from './Primitives/Typography';

export default {
  title: 'AKUI/Kbd',
  component: Kbd,
} as Meta<ComponentProps<typeof Kbd>>;

export const KbdStory: StoryFn<ComponentProps<typeof Kbd>> = (args) => {
  return (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>With Typography - default size</h3>
        <Typography>
          Press <Kbd {...args}>Ctrl</Kbd> + <Kbd {...args}>C</Kbd> to copy
        </Typography>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>With Typography - text-2xl</h3>
        <Typography className="text-2xl">
          Press <Kbd {...args}>Enter</Kbd> to continue
        </Typography>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>With Typography - text-3xl</h3>
        <Typography className="text-3xl">
          You can hide or show keyboard navigation help with <Kbd {...args}>H</Kbd> key
        </Typography>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>With Typography - text-sm</h3>
        <Typography className="text-sm">
          Use <Kbd {...args}>↑</Kbd> and <Kbd {...args}>↓</Kbd> to navigate
        </Typography>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>With Typography as h1 - text-5xl</h3>
        <Typography as="h1" className="text-5xl">
          <Kbd {...args}>Shift</Kbd> + <Kbd {...args}>Alt</Kbd> + <Kbd {...args}>F</Kbd>
        </Typography>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Arrow keys in Typography</h3>
        <Typography>
          <Kbd {...args}>←</Kbd> <Kbd {...args}>→</Kbd> <Kbd {...args}>↑</Kbd> <Kbd {...args}>↓</Kbd>
        </Typography>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Special characters in Typography</h3>
        <Typography>
          <Kbd {...args}>⌘</Kbd> <Kbd {...args}>⌥</Kbd> <Kbd {...args}>⇧</Kbd> <Kbd {...args}>⌃</Kbd>{' '}
          <Kbd {...args}>⎋</Kbd> <Kbd {...args}>⌫</Kbd>
        </Typography>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>In Song Selection context (similar to GameTip)</h3>
        <Typography className="text-lg">
          In Song Selection, hold <Kbd {...args}>↑</Kbd> or <Kbd {...args}>↓</Kbd> to jump to the next letter
        </Typography>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Without Typography (plain HTML)</h3>
        <p>
          Plain HTML: <Kbd {...args}>A</Kbd> <Kbd {...args}>S</Kbd> <Kbd {...args}>D</Kbd> <Kbd {...args}>F</Kbd>
        </p>
      </div>
    </div>
  );
};
