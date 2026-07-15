import { useLayoutEffect, useState } from 'react';

import { SongPreview } from '~/interfaces';
import useDebounce from '~/modules/hooks/use-debounce';
import { getUnverifiedSongsSearch } from '~/modules/songs/unverified-songs/api';

interface Props {
  searchText: string;
  fallbackThreshold: number;
  regularResultsCount: number;
  existingSongIds: Set<string>;
}

export default function useUnverifiedSongsSearch({
  searchText,
  fallbackThreshold,
  regularResultsCount,
  existingSongIds,
}: Props) {
  const [unverifiedSongs, setUnverifiedSongs] = useState<SongPreview[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const trimmedSearch = searchText.trim();
  const shouldFetchUnverifiedSongs = trimmedSearch.length > 0 && regularResultsCount < fallbackThreshold;
  const debouncedSearch = useDebounce(trimmedSearch, 350);
  const isWaitingForDebounce = shouldFetchUnverifiedSongs && debouncedSearch !== trimmedSearch;

  useLayoutEffect(() => {
    let isActive = true;
    // Use functional updaters so this effect doesn't depend on `unverifiedSongs`/`isFetching`
    // (which would re-run it right after a successful fetch and loop). Returning the same value
    // bails out of the state update, matching the previous guarded behaviour.
    const clearResults = () => {
      setUnverifiedSongs((current) => (current.length > 0 ? [] : current));
      setIsFetching((current) => (current ? false : current));
    };

    if (!shouldFetchUnverifiedSongs || !debouncedSearch) {
      clearResults();
      return () => {
        isActive = false;
      };
    }

    if (isWaitingForDebounce) {
      clearResults();
      return () => {
        isActive = false;
      };
    }

    setIsFetching(true);

    getUnverifiedSongsSearch(debouncedSearch).then((songs) => {
      if (!isActive) return;

      const mappedSongs: SongPreview[] = songs
        .filter((song) => !existingSongIds.has(song.songId))
        .map((song) => ({
          shortId: 0,
          local: false,
          isBuiltIn: false,
          lastUpdate: undefined,
          author: undefined,
          authorUrl: undefined,
          genre: undefined,
          year: undefined,
          edition: undefined,
          language: song.language,
          sourceUrl: undefined,
          videoGap: 0,
          artist: song.artist,
          artistOrigin: undefined,
          title: song.title,
          video: song.videoId,
          previewStart: undefined,
          previewEnd: undefined,
          gap: 0,
          bpm: 120,
          realBpm: 120,
          volume: undefined,
          manualVolume: undefined,
          id: song.songId,
          sourceType: 'unverified',
          sharedSongId: song.sharedSongId,
          isUnverifiedSong: true,
          tracksCount: 1,
          tracks: [{ start: 0 }],
          search: `${song.artist} ${song.title}`,
          bar: 4,
        }));

      setUnverifiedSongs(mappedSongs);
      setIsFetching(false);
    });

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, shouldFetchUnverifiedSongs, existingSongIds, isWaitingForDebounce]);

  return {
    unverifiedSongs,
    isLoading: shouldFetchUnverifiedSongs && (isWaitingForDebounce || isFetching),
  };
}
