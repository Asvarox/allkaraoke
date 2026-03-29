import { Meta, StoryFn } from '@storybook/react-vite';
import { ComponentProps } from 'react';
import { Chip } from './Chip';

export default {
  title: 'AKUI/Chip',
  component: Chip,
} as Meta<ComponentProps<typeof Chip>>;

export const AllVariants: StoryFn<ComponentProps<typeof Chip>> = (args) => {
  return (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Variants</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip {...args} variant="slate">
            slate
          </Chip>
          <Chip {...args} variant="blue">
            blue
          </Chip>
          <Chip {...args} variant="green">
            green
          </Chip>
          <Chip {...args} variant="orange">
            orange
          </Chip>
          <Chip {...args} variant="zinc">
            zinc
          </Chip>
          <Chip {...args} variant="esc">
            esc
          </Chip>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Labels</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip variant="blue">New</Chip>
          <Chip variant="green">Live</Chip>
          <Chip variant="orange">Beta</Chip>
          <Chip variant="slate">v1.0</Chip>
          <Chip variant="zinc">Default</Chip>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Short / icon-like</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Chip variant="blue">1</Chip>
          <Chip variant="green">2</Chip>
          <Chip variant="orange">!</Chip>
          <Chip variant="zinc">✓</Chip>
        </div>
      </div>
    </div>
  );
};
