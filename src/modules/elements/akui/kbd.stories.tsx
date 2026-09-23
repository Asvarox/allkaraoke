import { Meta, StoryObj } from '@storybook/react-vite';

import { StoryPage, StorySection } from '~/modules/elements/akui/story-layout';

import { Kbd } from './kbd';
import Typography from './primitives/typography';

function GalleryTemplate() {
  return (
    <StoryPage
      title="Kbd"
      description="A keyboard key inside running text. Sized in `em`, so it follows the font size of whatever it sits in rather than carrying a size of its own.">
      <StorySection title="Sizes" description="The same key in text of every size it shows up in.">
        <Typography className="text-sm">
          <Kbd>↑</Kbd> <Kbd>↓</Kbd> to navigate — <code>text-sm</code>
        </Typography>
        <Typography>
          <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd> to copy — default
        </Typography>
        <Typography className="text-2xl">
          <Kbd>Enter</Kbd> to continue — <code>text-2xl</code>
        </Typography>
        <Typography as="h1" className="text-5xl">
          <Kbd>Shift</Kbd> + <Kbd>Alt</Kbd> + <Kbd>F</Kbd>
        </Typography>
      </StorySection>

      <StorySection title="Arrows" layout="row">
        <Kbd>←</Kbd>
        <Kbd>→</Kbd>
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
      </StorySection>

      <StorySection title="Modifiers and specials" layout="row">
        <Kbd>⌘</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌃</Kbd>
        <Kbd>⎋</Kbd>
        <Kbd>⌫</Kbd>
      </StorySection>

      <StorySection
        title="Outside Typography"
        description="Plain HTML text still sizes it — it only needs a font size.">
        <p>
          <Kbd>A</Kbd> <Kbd>S</Kbd> <Kbd>D</Kbd> <Kbd>F</Kbd>
        </p>
      </StorySection>
    </StoryPage>
  );
}

function UseCasesTemplate() {
  return (
    <StoryPage title="Kbd — in context" description="Where the game points at a key.">
      <StorySection title="Game tip" description="The rotating tips under the song list.">
        <Typography className="text-lg">
          In Song Selection, hold <Kbd>↑</Kbd> or <Kbd>↓</Kbd> to jump to the next letter
        </Typography>
      </StorySection>

      <StorySection title="Help" description="The keyboard help panel's own hint about itself.">
        <Typography className="text-3xl">
          You can hide or show keyboard navigation help with <Kbd>H</Kbd> key
        </Typography>
      </StorySection>
    </StoryPage>
  );
}

export default {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Kbd>;

type Story = StoryObj<typeof Kbd>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};

export const UseCases: Story = {
  render: () => <UseCasesTemplate />,
};
