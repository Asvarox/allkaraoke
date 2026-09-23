import { Meta, StoryObj } from '@storybook/react-vite';

import { StoryPage, StorySection } from '~/modules/elements/akui/story-layout';

import { Menu } from '../menu';

function GalleryTemplate() {
  return (
    <StoryPage
      title="Menu"
      description="The panel a screen's options live on: a header, a column of `Menu.Button` rows, and the dividers and help text between them.">
      <StorySection title="Buttons" description="Only one row per screen carries the cursor.">
        <Menu className="w-full">
          <Menu.Button>A button</Menu.Button>
          <Menu.Button focused>A focused button</Menu.Button>
          <Menu.Button disabled>A disabled button</Menu.Button>
          <Menu.Button disabled focused>
            A disabled focused button
          </Menu.Button>
        </Menu>
      </StorySection>

      <StorySection
        title="Parts"
        description="Header, sub header, help text, divider and a button with `info` under it.">
        <Menu className="w-full" title="Settings">
          <Menu.SubHeader>Audio</Menu.SubHeader>
          <Menu.Button size="small" info="Applies to every player.">
            Microphones
          </Menu.Button>
          <Menu.Divider />
          <Menu.HelpText>Help text sits between rows and explains the ones around it.</Menu.HelpText>
          <Menu.Button size="small">Back</Menu.Button>
        </Menu>
      </StorySection>

      <StorySection title="Spacing" description="`tight` for menus with many rows.">
        <Menu className="w-full" spacing="tight">
          <Menu.Button size="small">One</Menu.Button>
          <Menu.Button size="small">Two</Menu.Button>
          <Menu.Button size="small">Three</Menu.Button>
        </Menu>
      </StorySection>

      <StorySection title="Modal" description="Built from the opaque dialog surface, as a `Modal` wraps it.">
        <Menu className="w-full" modal title="Leave the room?">
          <Menu.Button size="small">Stay</Menu.Button>
          <Menu.Button size="small" focused>
            Leave
          </Menu.Button>
        </Menu>
      </StorySection>
    </StoryPage>
  );
}

export default {
  title: 'Components/Menu',
  component: Menu,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Menu>;

type Story = StoryObj<typeof Menu>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};
