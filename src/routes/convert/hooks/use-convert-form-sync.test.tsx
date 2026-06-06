import { act, renderHook, waitFor } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { vitest } from 'vitest';
import ConvertForm from '~/routes/convert/convert-form';
import { useConvertFormContext } from '~/routes/convert/convert-form-context-hooks';
import { useConvertFormSync } from '~/routes/convert/hooks/use-convert-form-sync';

vitest.mock('~/modules/songs/hooks/use-song-index', () => ({
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

function wrapper({ children }: PropsWithChildren) {
  return <ConvertForm>{children}</ConvertForm>;
}

describe('useConvertFormSync', () => {
  it('drops unapplied draft txt changes when a structured field changes', async () => {
    const { result } = renderHook(() => useConvertFormSync(), { wrapper });

    act(() => {
      result.current.setDraftTxt(sampleTxt);
      result.current.applyDraftTxt();
    });

    await waitFor(() => {
      expect(result.current.canonicalTxt).toContain('#TITLE:test');
      expect(result.current.draftDirty).toBe(false);
    });

    act(() => result.current.setDraftTxt('#TITLE:Changed'));

    expect(result.current.draftDirty).toBe(true);

    act(() => result.current.onStructuredFieldChange('metadata.artist', 'Updated Artist'));

    await waitFor(() => {
      expect(result.current.draftDirty).toBe(false);
      expect(result.current.draftTxt).toContain('#ARTIST:Updated Artist');
    });
  });

  it('applies valid draft txt into committed fields', async () => {
    const { result } = renderHook(
      () => ({
        form: useConvertFormSync(),
        derived: useConvertFormContext(),
      }),
      { wrapper },
    );

    act(() => result.current.form.setDraftTxt(sampleTxt));
    act(() => result.current.form.applyDraftTxt());

    await waitFor(() => {
      expect(result.current.derived.finalSong?.title).toBe('test');
      expect(result.current.derived.finalSong?.artist).toBe('convert');
      expect(result.current.form.draftDirty).toBe(false);
      expect(result.current.form.parseError).toBeUndefined();
    });
  });

  it('auto-applies the first valid txt paste when no committed song exists', async () => {
    const { result } = renderHook(
      () => ({
        form: useConvertFormSync(),
        derived: useConvertFormContext(),
      }),
      { wrapper },
    );

    act(() => result.current.form.setDraftTxt(sampleTxt));

    await waitFor(() => {
      expect(result.current.derived.finalSong?.title).toBe('test');
      expect(result.current.derived.finalSong?.artist).toBe('convert');
      expect(result.current.form.draftDirty).toBe(false);
    });
  });

  it('leaves committed state untouched when draft txt is invalid', async () => {
    const { result } = renderHook(
      () => ({
        form: useConvertFormSync(),
        derived: useConvertFormContext(),
      }),
      { wrapper },
    );

    act(() => result.current.form.setDraftTxt(sampleTxt));
    act(() => result.current.form.applyDraftTxt());

    await waitFor(() => expect(result.current.derived.finalSong?.title).toBe('test'));

    act(() => result.current.form.setDraftTxt('#TITLE:Broken'));
    act(() => result.current.form.applyDraftTxt());

    expect(result.current.derived.finalSong?.title).toBe('test');
    expect(result.current.form.parseError).toBeTruthy();
  });
});
