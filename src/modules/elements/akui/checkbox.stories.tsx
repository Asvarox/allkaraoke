import { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useState } from 'react';

import { ButtonSize } from '~/modules/elements/akui/button';
import { StoryPage, StorySection } from '~/modules/elements/akui/story-layout';

import { Checkbox } from './checkbox';

/** `Checkbox` is controlled — it draws the box its `checked` prop asks for and nothing else. */
function DemoCheckbox({
  initialChecked = false,
  ...props
}: Omit<ComponentProps<typeof Checkbox>, 'checked'> & {
  initialChecked?: boolean;
}) {
  const [checked, setChecked] = useState(initialChecked);

  return <Checkbox {...props} checked={checked} onClick={() => setChecked((current) => !current)} />;
}

const SIZES: ButtonSize[] = ['mini', 'small', 'regular', 'large'];

function GalleryTemplate() {
  return (
    <StoryPage
      title="Checkbox"
      description="A button whose left-icon gutter holds the box, so the box lands exactly where any other button's left icon does. Labels are left-aligned and truncate to one line, so they line up down a list instead of each centring itself.">
      <StorySection title="Sizes" description="The box scales with the button's size. Defaults to `small`.">
        {SIZES.map((size) => (
          <DemoCheckbox key={size} size={size} initialChecked>
            {size}
          </DemoCheckbox>
        ))}
      </StorySection>

      <StorySection title="States" description="Click any of them — they're all live.">
        <DemoCheckbox>Unchecked</DemoCheckbox>
        <DemoCheckbox initialChecked>Checked</DemoCheckbox>
        {/* One row per screen carries the cursor; `focused` is what paints it. */}
        <DemoCheckbox focused>Focused</DemoCheckbox>
        <Checkbox checked={false} disabled>
          Disabled
        </Checkbox>
        <Checkbox checked disabled>
          Disabled, checked
        </Checkbox>
        <Checkbox checked readOnly>
          Read only
        </Checkbox>
      </StorySection>

      <StorySection title="Labels" description="A long label truncates rather than wrapping — the box never moves.">
        <DemoCheckbox initialChecked>Short</DemoCheckbox>
        <DemoCheckbox>Unassign the microphone after the song finishes, so the next player can join</DemoCheckbox>
        <DemoCheckbox initialChecked />
      </StorySection>

      <StorySection title="Info" description="Helper text under the row, rendered by `InputWrapper`.">
        <DemoCheckbox initialChecked info="Applies to every player in the room.">
          Unassign after song
        </DemoCheckbox>
      </StorySection>
    </StoryPage>
  );
}

const SONGS = [
  { id: 'bohemian', name: 'Bohemian Rhapsody' },
  { id: 'dancing', name: 'Dancing Queen' },
  { id: 'take-on-me', name: 'Take On Me' },
  { id: 'africa', name: 'Africa' },
];

/** A column of checkboxes is the point of the left-aligned label: every label starts on the same x. */
function MultiSelectTemplate() {
  const [selected, setSelected] = useState<string[]>(['dancing']);

  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const allSelected = selected.length === SONGS.length;

  return (
    <StoryPage
      title="Checkbox — multi-select"
      description="The song editor's selection column: a header that selects everything, then one row per song.">
      <StorySection title="Song list">
        <Checkbox
          checked={allSelected}
          onClick={() => setSelected(allSelected ? [] : SONGS.map((song) => song.id))}
          className="w-full">
          {allSelected ? 'Deselect all' : 'Select all'}
        </Checkbox>
        <div className="flex flex-col gap-2">
          {SONGS.map((song) => (
            <Checkbox
              key={song.id}
              checked={selected.includes(song.id)}
              onClick={() => toggle(song.id)}
              className="w-full">
              {song.name}
            </Checkbox>
          ))}
        </div>
        <p className="text-default/60 text-sm">
          {selected.length} of {SONGS.length} selected
        </p>
      </StorySection>
    </StoryPage>
  );
}

function UseCasesTemplate() {
  return (
    <StoryPage
      title="Checkbox — in context"
      description="The two shapes it shows up in: a settings row, and a compact row in a mirrored remote control list.">
      <StorySection title="Settings row">
        <DemoCheckbox initialChecked className="w-full" info="The mic is freed for the next player.">
          Unassign after song finished
        </DemoCheckbox>
        <DemoCheckbox className="w-full">Mute the backing track</DemoCheckbox>
      </StorySection>

      <StorySection
        title="Remote control row"
        description="Mirrored from the game — `mini`, on the remote's own surface.">
        <DemoCheckbox size="mini" className="w-full" initialChecked>
          Manual mic assignment
        </DemoCheckbox>
        <DemoCheckbox size="mini" className="w-full" disabled>
          Unavailable while singing
        </DemoCheckbox>
      </StorySection>
    </StoryPage>
  );
}

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Checkbox>;

type Story = StoryObj<typeof Checkbox>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};

export const MultiSelect: Story = {
  render: () => <MultiSelectTemplate />,
};

export const UseCases: Story = {
  render: () => <UseCasesTemplate />,
};
