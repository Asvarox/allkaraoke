import { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '~/modules/elements/akui/icon';
import { StoryPage, StorySection } from '~/modules/elements/akui/story-layout';

import { Button, ButtonLink, ButtonSize } from './button';

const SIZES: ButtonSize[] = ['mini', 'small', 'regular', 'large'];

function GalleryTemplate() {
  return (
    <StoryPage
      title="Button"
      description="The kit's base control. Everything the player can press — menu rows, switchers, checkboxes, fields — is built on its surface: the dark fill and the orange hairline that say “you can press this”.">
      <StorySection
        title="Sizes"
        description="Defaults to `regular`. `mini` and `small` are for dense UI and remote control screens.">
        {SIZES.map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
      </StorySection>

      <StorySection
        title="States"
        description="Only one control per screen carries the cursor, so only one here is `focused` — the others show what a focused one looks like when it can't be acted on.">
        <Button>Resting</Button>
        <Button focused>Focused</Button>
        <Button subtleFocused focused>
          Subtle focus
        </Button>
        <Button disabled>Disabled</Button>
        <Button disabled focused>
          Disabled, focused
        </Button>
        <Button inactive>Inactive — operable, switched off</Button>
        <Button readOnly>Read only</Button>
      </StorySection>

      <StorySection title="Link" description="`ButtonLink` is the same control rendered as an anchor.">
        <ButtonLink href="#">A link</ButtonLink>
        <ButtonLink href="#" focused>
          A focused link
        </ButtonLink>
        <ButtonLink href="#" disabled>
          A disabled link
        </ButtonLink>
      </StorySection>

      <StorySection
        title="Icons"
        description="A single icon still keeps the label centred: the opposite side reserves a matching gutter, so left-only and right-only read as mirror images.">
        <Button rightIcon={<Icon icon="ic:baseline-arrow-forward" />}>Right icon</Button>
        <Button leftIcon={<Icon icon="ic:baseline-arrow-back" />}>Left icon</Button>
        <Button leftIcon={<Icon icon="ic:baseline-arrow-back" />} rightIcon={<Icon icon="ic:baseline-arrow-forward" />}>
          Both icons
        </Button>
        <Button rightIcon={<Icon icon="ic:baseline-arrow-forward" />} disabled>
          Disabled with icon
        </Button>
      </StorySection>

      <StorySection title="Icon sizes" description="Icons scale with the button's `size`, so they stay proportional.">
        {SIZES.map((size) => (
          <Button
            key={size}
            size={size}
            leftIcon={<Icon icon="ic:baseline-arrow-back" />}
            rightIcon={<Icon icon="ic:baseline-arrow-forward" />}>
            {size}
          </Button>
        ))}
      </StorySection>

      <StorySection title="Icon only" description="No label: the button turns square." layout="row">
        {SIZES.map((size) => (
          <Button key={size} size={size} leftIcon={<Icon icon="ic:baseline-settings" />} aria-label="Settings" />
        ))}
      </StorySection>
    </StoryPage>
  );
}

function UseCasesTemplate() {
  return (
    <StoryPage title="Button — in context" description="The shapes it takes across the game.">
      <StorySection title="Main menu" description="A column of `regular` rows, one carrying the cursor.">
        <Button focused>Sing a song</Button>
        <Button>Duet</Button>
        <Button>Settings</Button>
      </StorySection>

      <StorySection title="Confirm dialog" description="Two `small` actions side by side." className="flex-row">
        <Button size="small">Cancel</Button>
        <Button size="small" focused>
          Delete
        </Button>
      </StorySection>

      <StorySection title="Navigation" description="Back and forward, the icon pointing where the button goes.">
        <Button size="small" leftIcon={<Icon icon="ic:baseline-arrow-back" />}>
          Back
        </Button>
        <Button size="small" rightIcon={<Icon icon="ic:baseline-arrow-forward" />}>
          Next
        </Button>
      </StorySection>
    </StoryPage>
  );
}

export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Button>;

type Story = StoryObj<typeof Button>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};

export const UseCases: Story = {
  render: () => <UseCasesTemplate />,
};
