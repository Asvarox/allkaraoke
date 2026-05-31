import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useFormContext } from 'react-hook-form';
import { vi } from 'vitest';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import ConvertForm from './convert-form';
import { ConvertFormValues } from './convert-form-context';
import { useConvertFormContext } from './convert-form-context-hooks';

vi.mock('~/modules/songs/hooks/use-song-index', () => ({
  default: () => ({ data: [] }),
}));

const sampleTxt = `
#TITLE:test
#ARTIST:convert
#LANGUAGE:English
#GENRE:genre
#REALBPM:200
#VOLUME:0.25
#YEAR:1992
#VIDEOGAP:30
#ALLKARAOKE_ARTISTORIGIN:US
#VIDEO:Sia - Santa's Coming For Us.mp4
#BPM:100
#GAP:3000
: 7 4 59 When
: 11 4 59  you're
- 20
: 20 4 59 And
`;

function ContextProbe() {
  const { finalSong } = useConvertFormContext();
  const { setValue } = useFormContext<ConvertFormValues>();

  return (
    <>
      <div data-testid="child">{finalSong ? finalSong.title : 'no-song'}</div>
      <div data-testid="artist">{finalSong ? finalSong.artist : 'no-artist'}</div>
      <button onClick={() => setValue('committedSong', convertTxtToSong(sampleTxt), { shouldDirty: true })}>
        Load TXT
      </button>
      <button onClick={() => setValue('metadata.artist', 'Updated Artist', { shouldDirty: true })}>
        Update Artist
      </button>
      <button onClick={() => setValue('metadata.title', 'Updated Title', { shouldDirty: true })}>Update Title</button>
    </>
  );
}

describe('ConvertForm', () => {
  it('exposes derived final song data through context', () => {
    render(
      <ConvertForm initialSong={undefined}>
        <ContextProbe />
      </ConvertForm>,
    );

    expect(screen.getByTestId('child')).toHaveTextContent('no-song');
  });

  it('derives final song from parsed txt and later metadata edits in create flow', async () => {
    render(
      <ConvertForm initialSong={undefined}>
        <ContextProbe />
      </ConvertForm>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Load TXT' }));

    await waitFor(() => {
      expect(screen.getByTestId('child')).toHaveTextContent('test');
      expect(screen.getByTestId('artist')).toHaveTextContent('convert');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Update Artist' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update Title' }));

    await waitFor(() => {
      expect(screen.getByTestId('child')).toHaveTextContent('Updated Title');
      expect(screen.getByTestId('artist')).toHaveTextContent('Updated Artist');
    });
  });
});
