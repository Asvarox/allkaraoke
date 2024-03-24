import { render, screen } from '@testing-library/react';
import SongFlag from 'Scenes/SingASong/SongSelection/Components/SongCard/SongFlag';
import { generateSong } from 'utils/testUtils';

describe('SongCard', () => {
  it('SongFlag should not render for GB', async () => {
    const song = generateSong([], {
      artistOrigin: 'GB',
      language: ['English'],
    });
    render(<SongFlag song={song} />);

    expect(screen.queryByRole('img')).toBeNull();
  });
  it('SongFlag should not render for US', async () => {
    const song = generateSong([], {
      artistOrigin: 'US',
      language: ['English'],
    });
    render(<SongFlag song={song} />);

    expect(screen.queryByRole('img')).toBeNull();
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
