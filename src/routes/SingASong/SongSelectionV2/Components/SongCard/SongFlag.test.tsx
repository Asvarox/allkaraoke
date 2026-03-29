import { render, screen } from '@testing-library/react';
import { generateSong } from '~/modules/utils/testUtils';
import SongFlag from '~/routes/SingASong/SongSelectionV2/Components/SongCard/SongFlag';

describe('SongCard', () => {
  it('SongFlag should render GB flag for GB origin with English language', async () => {
    const song = generateSong([], {
      artistOrigin: 'GB',
      language: ['English'],
    });
    render(<SongFlag song={song} />);

    expect(await screen.findByRole('img')).toHaveAttribute('alt', 'gb');
  });
  it('SongFlag should render US flag for US origin with English language', async () => {
    const song = generateSong([], {
      artistOrigin: 'US',
      language: ['English'],
    });
    render(<SongFlag song={song} />);

    expect(await screen.findByRole('img')).toHaveAttribute('alt', 'us');
  });

  it('SongFlag should render for US origin if the language is not English', async () => {
    const song = generateSong([], {
      artistOrigin: 'US',
      language: ['Spanish'],
    });
    render(<SongFlag song={song} />);

    expect(await screen.findByRole('img')).toHaveAttribute('alt', 'es');
  });

  it('SongFlag should render for non UK/US origin if the language is English', async () => {
    const song = generateSong([], {
      artistOrigin: 'NZ',
      language: ['English'],
    });
    render(<SongFlag song={song} />);

    expect(await screen.findByRole('img')).toHaveAttribute('alt', 'nz');
  });

  it('SongFlag should render language flag for non Spanish origin if the language is not Spanish', async () => {
    const song = generateSong([], {
      artistOrigin: 'PL',
      language: ['Spanish'],
    });
    render(<SongFlag song={song} />);

    expect(await screen.findByRole('img')).toHaveAttribute('alt', 'es');
  });

  it('SongFlag should render origin flag for Spanish origin if the language is Spanish', async () => {
    const song = generateSong([], {
      artistOrigin: 'MX',
      language: ['Spanish'],
    });
    render(<SongFlag song={song} />);

    expect(await screen.findByRole('img')).toHaveAttribute('alt', 'mx');
  });
});
