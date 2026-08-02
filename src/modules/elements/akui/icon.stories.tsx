import { Meta, StoryObj } from '@storybook/react-vite';

import { Icon, IconName } from './icon';

const sampleIcons: IconName[] = [
  'ic:baseline-close',
  'ic:baseline-check',
  'ic:baseline-delete',
  'ic:baseline-edit',
  'ic:baseline-search',
  'ic:baseline-settings',
  'ic:baseline-warning',
  'ic:baseline-arrow-back',
  'ic:baseline-arrow-forward',
  'ic:baseline-play-arrow',
];

function GalleryTemplate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-8 text-white">
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold">AKUI Icon</h1>
          <p className="text-sm text-white/60">
            A thin wrapper around <code>@iconify-icon/react</code> — the only place in the app allowed to import it
            directly. Pass any iconify icon identifier via the <code>icon</code> prop.
          </p>
        </div>

        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-medium">Default size (font-size driven)</h2>
          <div className="flex flex-wrap items-center gap-4 text-3xl">
            {sampleIcons.map((icon) => (
              <Icon key={icon} icon={icon} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-medium">Explicit width/height</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Icon icon="ic:baseline-warning" width="16" height="16" />
            <Icon icon="ic:baseline-warning" width="24" height="24" />
            <Icon icon="ic:baseline-warning" width="48" height="48" />
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-medium">Color follows text color</h2>
          <div className="flex flex-wrap items-center gap-4 text-4xl">
            <Icon icon="ic:baseline-favorite" className="text-red-500" />
            <Icon icon="ic:baseline-favorite" className="text-blue-500" />
            <Icon icon="ic:baseline-favorite" className="text-green-500" />
          </div>
        </section>
      </div>
    </div>
  );
}

export default {
  title: 'AKUI/Icon',
  component: Icon,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Icon>;

type Story = StoryObj<typeof Icon>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};
