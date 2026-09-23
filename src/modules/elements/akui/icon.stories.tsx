import { Meta, StoryObj } from '@storybook/react-vite';

import { StoryPage, StorySection } from '~/modules/elements/akui/story-layout';

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
    <StoryPage
      title="Icon"
      description={
        <>
          A thin wrapper around <code>@iconify-icon/react</code> — the only place in the app allowed to import it
          directly. Pass any iconify identifier from <code>IconName</code> via the <code>icon</code> prop.
        </>
      }>
      <StorySection
        title="Default size"
        description="Driven by the surrounding font size."
        layout="row"
        className="text-3xl">
        {sampleIcons.map((icon) => (
          <Icon key={icon} icon={icon} />
        ))}
      </StorySection>

      <StorySection title="Size" description="`size` in Tailwind spacing units, or a responsive value." layout="row">
        {[4, 5, 6, 8, 12].map((size) => (
          <Icon key={size} icon="ic:baseline-warning" size={size} />
        ))}
      </StorySection>

      <StorySection title="Explicit width and height" layout="row">
        <Icon icon="ic:baseline-warning" width="16" height="16" />
        <Icon icon="ic:baseline-warning" width="24" height="24" />
        <Icon icon="ic:baseline-warning" width="48" height="48" />
      </StorySection>

      <StorySection title="Colour" description="Follows the text colour." layout="row" className="text-4xl">
        <Icon icon="ic:baseline-favorite" className="text-active" />
        <Icon icon="ic:baseline-favorite" className="text-danger" />
        <Icon icon="ic:baseline-favorite" className="text-success" />
        <Icon icon="ic:baseline-favorite" className="text-info" />
      </StorySection>
    </StoryPage>
  );
}

export default {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Icon>;

type Story = StoryObj<typeof Icon>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};
