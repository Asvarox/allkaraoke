import { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps } from 'react';

import { StoryPage, StorySection } from '~/modules/elements/akui/story-layout';

import { Chip } from './chip';

type Variant = NonNullable<ComponentProps<typeof Chip>['variant']>;

const CATEGORY_VARIANTS: Variant[] = ['slate', 'blue', 'green', 'orange', 'zinc', 'esc'];
const STATUS_VARIANTS: Variant[] = ['danger', 'warning', 'success', 'info'];

function GalleryTemplate() {
  return (
    <StoryPage
      title="Chip"
      description="A small uppercase tag. Two separate axes: a category says what a thing is, a status says how it's going.">
      <StorySection
        title="Category"
        description="Picked for being told apart from each other — `green` here means “new”, not “good”. Defaults to `slate`."
        layout="row">
        {CATEGORY_VARIANTS.map((variant) => (
          <Chip key={variant} variant={variant}>
            {variant}
          </Chip>
        ))}
      </StorySection>

      <StorySection
        title="Status"
        description="The four shared status roles, so a chip reporting a failure matches every other way the app reports one."
        layout="row">
        {STATUS_VARIANTS.map((variant) => (
          <Chip key={variant} variant={variant}>
            {variant}
          </Chip>
        ))}
      </StorySection>

      <StorySection
        title="Short"
        description="Never narrower than it is tall, so a single character stays square."
        layout="row">
        <Chip variant="blue">1</Chip>
        <Chip variant="green">2</Chip>
        <Chip variant="orange">!</Chip>
        <Chip variant="zinc">✓</Chip>
      </StorySection>
    </StoryPage>
  );
}

function UseCasesTemplate() {
  return (
    <StoryPage title="Chip — in context" description="Labels next to the thing they describe.">
      <StorySection title="Labels" layout="row">
        <Chip variant="blue">New</Chip>
        <Chip variant="green">Live</Chip>
        <Chip variant="orange">Beta</Chip>
        <Chip variant="slate">v1.0</Chip>
        <Chip variant="zinc">Default</Chip>
      </StorySection>

      <StorySection title="Connection" description="A remote mic's status in the player list." layout="row">
        <Chip variant="success">Connected</Chip>
        <Chip variant="info">Connecting</Chip>
        <Chip variant="warning">Lagging</Chip>
        <Chip variant="danger">Disconnected</Chip>
      </StorySection>
    </StoryPage>
  );
}

export default {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Chip>;

type Story = StoryObj<typeof Chip>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};

export const UseCases: Story = {
  render: () => <UseCasesTemplate />,
};
