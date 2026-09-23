import { Meta, StoryObj } from '@storybook/react-vite';

import { StoryPage, StorySection } from '~/modules/elements/akui/story-layout';

import { Skeleton } from './skeleton';

function GalleryTemplate() {
  return (
    <StoryPage
      title="Skeleton"
      description="Loading blocks for text, thumbnails, cards and compact UI. Shape it with size and radius classes.">
      <StorySection title="Text">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-5 w-40" />
      </StorySection>

      <StorySection title="Shapes" layout="row">
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </StorySection>

      <StorySection title="Card" description="A song row while its details load.">
        <div className="flex rounded-xl bg-black/40 p-3">
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="aspect-video w-24 shrink-0 self-start rounded-lg" />
        </div>
      </StorySection>
    </StoryPage>
  );
}

export default {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Skeleton>;

type Story = StoryObj<typeof Skeleton>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};
