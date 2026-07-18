import { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from './skeleton';

function GalleryTemplate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-8 text-white">
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold">AKUI Skeleton</h1>
          <p className="text-sm text-white/60">Reusable loading blocks for text, thumbnails, cards, and compact UI.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-medium">Text</h2>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-5 w-40" />
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-medium">Shapes</h2>
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-medium">Card</h2>
            <div className="flex rounded-xl bg-black/40 p-3">
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="aspect-video w-24 shrink-0 self-start rounded-lg" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default {
  title: 'AKUI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Skeleton>;

type Story = StoryObj<typeof Skeleton>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};
