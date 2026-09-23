import { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { StoryPage, StorySection } from '~/modules/elements/akui/story-layout';

import { Selector } from './selector';

const SIZES = ['Small', 'Medium', 'Large', 'Extra Large'];
const GENRES = [
  'Pop',
  'Rock',
  'Jazz',
  'Classical',
  'Hip-Hop',
  'Electronic',
  'Country',
  'R&B',
  'Reggae',
  'Folk',
  'Metal',
  'Blues',
];

/** `Selector` is controlled, so every sample needs an owner for the value. */
function DemoSelector({ items, initialValue }: { items: string[]; initialValue: string }) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="flex flex-col gap-2">
      <Selector value={value} onChange={setValue}>
        {items.map((item) => (
          <Selector.Item key={item} value={item}>
            {item}
          </Selector.Item>
        ))}
      </Selector>
      <p className="text-sm opacity-70">Selected: {value}</p>
    </div>
  );
}

function GalleryTemplate() {
  return (
    <StoryPage
      title="Selector"
      description="A row of mutually exclusive options, all visible at once — for short lists where opening a menu would hide the choice.">
      <StorySection title="Basic">
        <DemoSelector items={SIZES} initialValue="Medium" />
      </StorySection>

      <StorySection
        title="Overflow"
        description="More options than fit: the row scrolls and grows arrows at the edges it can scroll towards.">
        <div className="max-w-xs">
          <DemoSelector items={GENRES} initialValue="Jazz" />
        </div>
      </StorySection>
    </StoryPage>
  );
}

function UseCasesTemplate() {
  return (
    <StoryPage title="Selector — in context" description="Several selectors stacked into one filter panel.">
      <StorySection title="Size">
        <DemoSelector items={SIZES} initialValue="Medium" />
      </StorySection>
      <StorySection title="Genre" description="Overflows, like it would in a narrow panel.">
        <div className="max-w-sm">
          <DemoSelector items={GENRES} initialValue="Pop" />
        </div>
      </StorySection>
    </StoryPage>
  );
}

export default {
  title: 'Components/Selector',
  component: Selector,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Selector>;

type Story = StoryObj<typeof Selector>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};

export const UseCases: Story = {
  render: () => <UseCasesTemplate />,
};
