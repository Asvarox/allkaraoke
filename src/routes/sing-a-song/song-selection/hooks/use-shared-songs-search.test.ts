import { renderHook } from '@testing-library/react';
import { act } from 'react';
import type { Mock } from 'vitest';
import { afterEach, vitest } from 'vitest';
import { getSharedSongsSearch } from '~/modules/songs/shared-songs/api';
import type { SharedSongSearchResult } from '~/modules/songs/shared-songs/types';
import useSharedSongsSearch from '~/routes/sing-a-song/song-selection/hooks/use-shared-songs-search';

vitest.mock('~/modules/songs/shared-songs/api');

describe('useSharedSongsSearch', () => {
  afterEach(() => {
    vitest.useRealTimers();
    vitest.resetAllMocks();
  });

  it('keeps loading while the fallback search is debouncing and fetching', async () => {
    vitest.useFakeTimers();
    const existingSongIds = new Set<string>();

    let resolveRequest: (value: SharedSongSearchResult[]) => void = () => {};
    (getSharedSongsSearch as Mock).mockImplementation(
      () =>
        new Promise<SharedSongSearchResult[]>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const { result, rerender } = renderHook(
      ({ searchText, regularResultsCount }) =>
        useSharedSongsSearch({
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
    expect(result.current.sharedSongs).toEqual([]);

    await act(async () => {
      await vitest.advanceTimersByTimeAsync(350);
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.sharedSongs).toEqual([]);

    await act(async () => {
      resolveRequest([
        {
          artist: 'Queen',
          externalSongId: 'external-1',
          language: ['English'],
          songId: 'shared-queen',
          title: 'Queen Song',
          videoId: 'video-1',
        },
      ]);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.sharedSongs).toHaveLength(1);
    expect(result.current.sharedSongs[0]).toMatchObject({
      id: 'shared-queen',
      artist: 'Queen',
      title: 'Queen Song',
      isUnverifiedSharedSong: true,
    });
  });
});
