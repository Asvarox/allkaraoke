import { Meta, StoryFn } from '@storybook/react-vite';
import { useState } from 'react';
import { Selector } from './Selector';

export default {
  title: 'AKUI/Selector',
  component: Selector,
} as Meta;

const SIZES = ['Small', 'Medium', 'Large', 'Extra Large'];
const GENRES = [
  'Pop',
  'Rock',
  'Jazz',
  'Classical',
  'Hip-Hop',
  'Electronic',
  'Country',
  'R&B',
  'Reggae',
  'Folk',
  'Metal',
  'Blues',
];

export const Basic: StoryFn = () => {
  const [value, setValue] = useState('Medium');
  return (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'column', maxWidth: 400 }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Basic selector</h3>
      <Selector value={value} onChange={setValue}>
        {SIZES.map((size) => (
          <Selector.Item key={size} value={size}>
            {size}
          </Selector.Item>
        ))}
      </Selector>
      <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Selected: {value}</p>
    </div>
  );
};

export const Overflow: StoryFn = () => {
  const [value, setValue] = useState('Jazz');
  return (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'column', maxWidth: 320 }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Overflow with scroll arrows</h3>
      <Selector value={value} onChange={setValue}>
        {GENRES.map((genre) => (
          <Selector.Item key={genre} value={genre}>
            {genre}
          </Selector.Item>
        ))}
      </Selector>
      <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Selected: {value}</p>
    </div>
  );
};

export const MultipleSelectors: StoryFn = () => {
  const [size, setSize] = useState('Medium');
  const [genre, setGenre] = useState('Pop');
  return (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'column', maxWidth: 400 }}>
      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Size</h3>
        <Selector value={size} onChange={setSize}>
          {SIZES.map((s) => (
            <Selector.Item key={s} value={s}>
              {s}
            </Selector.Item>
          ))}
        </Selector>
      </div>
      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Genre (overflow)</h3>
        <Selector value={genre} onChange={setGenre}>
          {GENRES.map((g) => (
            <Selector.Item key={g} value={g}>
              {g}
            </Selector.Item>
          ))}
        </Selector>
      </div>
      <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>
        Size: {size} · Genre: {genre}
      </p>
    </div>
  );
};
