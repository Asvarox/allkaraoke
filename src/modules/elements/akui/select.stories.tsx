import { Meta, StoryFn } from '@storybook/react-vite';
import { useState } from 'react';

import { Flag } from '~/modules/elements/flag';

import { Select, SelectOption } from './select';

export default {
  title: 'AKUI/Select',
  component: Select,
} as Meta;

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

export const Basic: StoryFn = () => {
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'column', maxWidth: 400 }}>
      <h3 style={{ fontSize: '1rem' }}>Country picker with icons</h3>
      <Select focused label="" placeholder="Select Country" value={value} onChange={setValue} options={COUNTRIES} />
      <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Selected: {value || '(prefer not to say)'}</p>
    </div>
  );
};

export const WithoutIcons: StoryFn = () => {
  const [value, setValue] = useState('jazz');

  return (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'column', maxWidth: 400 }}>
      <h3 style={{ fontSize: '1rem' }}>Plain options</h3>
      <Select focused label="Genre" value={value} onChange={setValue} options={GENRES} />
      <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Selected: {value}</p>
    </div>
  );
};

export const Unfocused: StoryFn = () => {
  const [value, setValue] = useState('pl');

  return (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'column', maxWidth: 400 }}>
      <h3 style={{ fontSize: '1rem' }}>Not keyboard-focused</h3>
      <Select focused={false} label="Country" value={value} onChange={setValue} options={COUNTRIES} />
    </div>
  );
};
