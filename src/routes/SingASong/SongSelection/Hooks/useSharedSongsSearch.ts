import { useEffect, useState } from 'react';
import { SongPreview } from '~/interfaces';
import { getSharedSongsSearch } from '~/modules/Songs/sharedSongs/api';
import useDebounce from '~/modules/hooks/useDebounce';

interface Props {
  searchText: string;
  fallbackThreshold: number;
  regularResultsCount: number;
  existingSongIds: Set<string>;
}

export default function useSharedSongsSearch({
  searchText,
  fallbackThreshold,
  regularResultsCount,
  existingSongIds,
}: Props) {
  const [sharedSongs, setSharedSongs] = useState<SongPreview[]>([]);
  const trimmedSearch = searchText.trim();
  const shouldFetchSharedSongs = trimmedSearch.length > 0 && regularResultsCount < fallbackThreshold;
  const debouncedSearch = useDebounce(trimmedSearch, 350);

  useEffect(() => {
    let isActive = true;

    if (!shouldFetchSharedSongs || !debouncedSearch) {
      setSharedSongs([]);
      return () => {
        isActive = false;
      };
    }

    getSharedSongsSearch(debouncedSearch).then((songs) => {
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
          sourceType: 'shared',
          externalSongId: song.externalSongId,
          isUnverifiedSharedSong: true,
          tracksCount: 1,
          tracks: [{ start: 0 }],
          search: `${song.artist} ${song.title}`,
          bar: 4,
        }));

      setSharedSongs(mappedSongs);
    });

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, shouldFetchSharedSongs, existingSongIds]);

  return sharedSongs;
}
