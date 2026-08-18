import { Meta, StoryFn } from '@storybook/react-vite';
import { useState } from 'react';

import { Select, SelectOption } from './select';

export default {
  title: 'AKUI/Select',
  component: Select,
} as Meta;

const COUNTRIES: SelectOption[] = [
  { value: '', label: 'Prefer not to say', icon: '🌍' },
  { value: 'pl', label: 'Poland', icon: '🇵🇱' },
  { value: 'de', label: 'Germany', icon: '🇩🇪' },
  { value: 'fr', label: 'France', icon: '🇫🇷' },
  { value: 'gb', label: 'United Kingdom', icon: '🇬🇧' },
  { value: 'us', label: 'United States', icon: '🇺🇸' },
  { value: 'br', label: 'Brazil', icon: '🇧🇷' },
  { value: 'jp', label: 'Japan', icon: '🇯🇵' },
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
      <Select focused label="Country" value={value} onChange={setValue} options={COUNTRIES} />
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
