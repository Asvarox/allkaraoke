import { renderHook } from '@testing-library/react';
import { act } from 'react';
import type { Mock } from 'vitest';
import { afterEach, vitest } from 'vitest';
import { getUnverifiedSongsSearch } from '~/modules/songs/unverified-songs/api';
import type { UnverifiedSongSearchResult } from '~/modules/songs/unverified-songs/types';
import useUnverifiedSongsSearch from '~/routes/sing-a-song/song-selection/hooks/use-unverified-songs-search';

vitest.mock('~/modules/songs/unverified-songs/api');

describe('useUnverifiedSongsSearch', () => {
  afterEach(() => {
    vitest.useRealTimers();
    vitest.resetAllMocks();
  });

  it('keeps loading while the fallback search is debouncing and fetching', async () => {
    vitest.useFakeTimers();
    const existingSongIds = new Set<string>();

    let resolveRequest: (value: UnverifiedSongSearchResult[]) => void = () => {};
    (getUnverifiedSongsSearch as Mock).mockImplementation(
      () =>
        new Promise<UnverifiedSongSearchResult[]>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const { result, rerender } = renderHook(
      ({ searchText, regularResultsCount }) =>
        useUnverifiedSongsSearch({
          searchText,
          fallbackThreshold: 8,
          regularResultsCount,
          existingSongIds,
        }),
      {
        initialProps: {
          searchText: '',
          regularResultsCount: 0,
        },
      },
    );

    expect(result.current.isLoading).toBe(false);

    rerender({
      searchText: 'queen',
      regularResultsCount: 0,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.unverifiedSongs).toEqual([]);

    await act(async () => {
      await vitest.advanceTimersByTimeAsync(350);
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.unverifiedSongs).toEqual([]);

    await act(async () => {
      resolveRequest([
        {
          artist: 'Queen',
          sharedSongId: 'external-1',
          language: ['English'],
          songId: 'shared-queen',
          title: 'Queen Song',
          videoId: 'video-1',
        },
      ]);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.unverifiedSongs).toHaveLength(1);
    expect(result.current.unverifiedSongs[0]).toMatchObject({
      id: 'shared-queen',
      artist: 'Queen',
      title: 'Queen Song',
      isUnverifiedSong: true,
    });
  });
});
