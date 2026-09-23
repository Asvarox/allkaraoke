import { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useState } from 'react';

import { StoryPage, StorySection } from '~/modules/elements/akui/story-layout';

import { BottomSheet } from './bottom-sheet';
import { Button } from './button';

/** A button that opens its own sheet of options, and closes it on a pick. */
function DemoSheet({
  trigger,
  items,
  ...props
}: Omit<ComponentProps<typeof BottomSheet>, 'open' | 'onClose' | 'children'> & { trigger: string; items: string[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <Button size="small" onClick={() => setOpen(true)}>
        {selected ?? trigger}
      </Button>
      <BottomSheet {...props} open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-1 pb-2">
          {items.map((label) => (
            <Button
              key={label}
              size="small"
              focused={label === selected}
              className="w-full justify-start"
              onClick={() => {
                setSelected(label);
                setOpen(false);
              }}>
              {label}
            </Button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}

const OPTIONS = ['Option A', 'Option B', 'Option C', 'Option D'];
const MANY_ITEMS = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

function GalleryTemplate() {
  return (
    <StoryPage
      title="Bottom Sheet"
      description="A list of choices that slides up from the bottom edge on phones. Closes on a pick or a tap on the backdrop.">
      <StorySection title="Basic">
        <DemoSheet trigger="Open sheet" items={OPTIONS} />
      </StorySection>

      <StorySection
        title="With title"
        description="`title` sits above the content. The picked option carries the focus.">
        <DemoSheet trigger="Choose an option" title="Choose an option" items={[...OPTIONS, 'Option E']} />
      </StorySection>

      <StorySection title="Many items" description="The content scrolls once it passes 60% of the screen height.">
        <DemoSheet trigger="Open long list" title="Scroll to see more" items={MANY_ITEMS} />
      </StorySection>
    </StoryPage>
  );
}

export default {
  title: 'Components/Bottom Sheet',
  component: BottomSheet,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
} satisfies Meta<typeof BottomSheet>;

type Story = StoryObj<typeof BottomSheet>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};
