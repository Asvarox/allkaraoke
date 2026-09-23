import { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useState } from 'react';

import { StoryPage, StorySection } from '~/modules/elements/akui/story-layout';
import { Flag } from '~/modules/elements/flag';

import { Select, SelectOption } from './select';

// Sized by whichever container `Select` puts it in - the option list, or the strip on the field -
// same as `flagIcon` in the leaderboard prompt this story mirrors.
const flagIcon = (isocode: string) => <Flag isocode={isocode} loading="lazy" className="h-full w-full object-cover" />;

const COUNTRIES: SelectOption[] = [
  { value: '', label: 'Prefer not to say', icon: flagIcon('un') },
  { value: 'pl', label: 'Poland', icon: flagIcon('pl') },
  { value: 'de', label: 'Germany', icon: flagIcon('de') },
  { value: 'fr', label: 'France', icon: flagIcon('fr') },
  { value: 'gb', label: 'United Kingdom', icon: flagIcon('gb') },
  { value: 'us', label: 'United States', icon: flagIcon('us') },
  { value: 'br', label: 'Brazil', icon: flagIcon('br') },
  { value: 'jp', label: 'Japan', icon: flagIcon('jp') },
];

const GENRES: SelectOption[] = ['Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop', 'Electronic', 'Country'].map(
  (genre) => ({
    value: genre.toLowerCase(),
    label: genre,
  }),
);

/** `Select` is controlled, so every sample needs an owner for the value. */
function DemoSelect({
  initialValue = '',
  focused = false,
  ...props
}: Omit<ComponentProps<typeof Select>, 'value' | 'onChange' | 'focused'> & {
  initialValue?: string;
  focused?: boolean;
}) {
  const [value, setValue] = useState(initialValue);

  return <Select {...props} focused={focused} value={value} onChange={setValue} />;
}

function GalleryTemplate() {
  return (
    <StoryPage
      title="Select"
      description="A searchable pick from a fixed list. Focusing the field opens the list, typing filters it, Enter commits the highlighted option and Escape reverts — the committed value always comes from `options`.">
      <StorySection title="Icons" description="An option's `icon` shows in the list and as a strip on the field.">
        <DemoSelect label="Country" options={COUNTRIES} initialValue="pl" />
        <DemoSelect label="" placeholder="Select Country" options={COUNTRIES} />
      </StorySection>

      <StorySection title="Plain options">
        <DemoSelect label="Genre" options={GENRES} initialValue="jazz" />
      </StorySection>

      <StorySection
        title="States"
        description="Only one control per screen is `focused`. A focused field claims the letter keys, same as `Input`.">
        <DemoSelect label="Resting" options={GENRES} initialValue="rock" />
        <DemoSelect label="Focused" options={GENRES} initialValue="pop" focused />
        <DemoSelect label="Disabled" options={GENRES} initialValue="jazz" disabled />
      </StorySection>
    </StoryPage>
  );
}

function UseCasesTemplate() {
  const [country, setCountry] = useState('');

  return (
    <StoryPage title="Select — in context" description="The post-game leaderboard identity field.">
      <StorySection
        title="Leaderboard country"
        description="No label: the placeholder carries the meaning, the flag fills the rest.">
        <Select
          focused
          label=""
          aria-label="Country"
          placeholder="Select Country"
          value={country}
          onChange={setCountry}
          options={COUNTRIES}
        />
        <p className="text-sm opacity-70">Selected: {country || '(prefer not to say)'}</p>
      </StorySection>
    </StoryPage>
  );
}

export default {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Select>;

type Story = StoryObj<typeof Select>;

export const Gallery: Story = {
  render: () => <GalleryTemplate />,
};

export const UseCases: Story = {
  render: () => <UseCasesTemplate />,
};
