import { useMemo } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Song, SongPreview } from '~/interfaces';
import useDebounce from '~/modules/hooks/use-debounce';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import SongDao from '~/modules/songs/songs-service';
import { getVideoId } from '~/modules/songs/utils/convert-txt-to-song';
import getSongId from '~/modules/songs/utils/get-song-id';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';

const FINAL_SONG_DEBOUNCE_MS = 200;

interface UseConvertFormDerivedProps {
  control: Control<ConvertFormValues>;
  initialSong?: Song;
}

export interface ConvertFormDerivedValues {
  conversionResult: Song | undefined;
  duplicateCandidate: SongPreview | undefined;
  finalSong: Song | undefined;
  isEdit: boolean;
}

export default function useConvertFormDerived({ control, initialSong }: UseConvertFormDerivedProps) {
  const basicData = useWatch<ConvertFormValues, 'basicData'>({ control, name: 'basicData' });
  const authorAndVideo = useWatch<ConvertFormValues, 'authorAndVideo'>({ control, name: 'authorAndVideo' });
  const committedSong = useWatch<ConvertFormValues, 'committedSong'>({ control, name: 'committedSong' });
  const metadata = useWatch<ConvertFormValues, 'metadata'>({ control, name: 'metadata' });
  const editedSong = useWatch<ConvertFormValues, 'editedSong'>({ control, name: 'editedSong' });
  const { data: songs } = useSongIndex(true);
  const isEdit = !!initialSong;
  const debouncedMetadata = useDebounce(metadata, FINAL_SONG_DEBOUNCE_MS);
  const debouncedAuthor = useDebounce(authorAndVideo.author, FINAL_SONG_DEBOUNCE_MS);
  const debouncedAuthorUrl = useDebounce(authorAndVideo.authorUrl, FINAL_SONG_DEBOUNCE_MS);
  const debouncedSourceUrl = useDebounce(basicData.sourceUrl, FINAL_SONG_DEBOUNCE_MS);

  const conversionResult: Song | undefined = useMemo(() => {
    if (committedSong) {
      return {
        ...committedSong,
        video: getVideoId(authorAndVideo.video) || committedSong.video,
        author: authorAndVideo.author || committedSong.author || initialSong?.author || '',
        authorUrl: authorAndVideo.authorUrl || committedSong.authorUrl || initialSong?.authorUrl || '',
        sourceUrl: basicData.sourceUrl || committedSong.sourceUrl || initialSong?.sourceUrl || '',
      };
    }

    if (!isEdit || !initialSong) {
      return undefined;
    }

    return {
      ...initialSong,
      video: getVideoId(authorAndVideo.video) || initialSong.video,
      author: authorAndVideo.author || initialSong.author || '',
      authorUrl: authorAndVideo.authorUrl || initialSong.authorUrl || '',
      sourceUrl: basicData.sourceUrl || initialSong.sourceUrl || '',
    };
  }, [
    authorAndVideo.author,
    authorAndVideo.authorUrl,
    authorAndVideo.video,
    basicData.sourceUrl,
    committedSong,
    initialSong,
    isEdit,
  ]);

  const duplicateCandidate = useMemo(
    () =>
      isEdit || !conversionResult
        ? undefined
        : songs?.find(
            (addedSong) => SongDao.generateSongFile(addedSong) === SongDao.generateSongFile(conversionResult),
          ),
    [conversionResult, isEdit, songs],
  );

  const finalSong = useMemo(() => {
    const baseSong = editedSong ?? committedSong ?? initialSong ?? conversionResult;

    if (!baseSong) {
      return undefined;
    }

    const resolvedMetadata = {
      artist: debouncedMetadata.artist || baseSong.artist,
      artistOrigin: debouncedMetadata.artistOrigin || baseSong.artistOrigin,
      edition: debouncedMetadata.edition || baseSong.edition,
      genre: debouncedMetadata.genre || baseSong.genre,
      language: debouncedMetadata.language.length ? debouncedMetadata.language : baseSong.language,
      previewEnd: debouncedMetadata.previewEnd ?? baseSong.previewEnd,
      previewStart: debouncedMetadata.previewStart ?? baseSong.previewStart,
      realBpm: (() => {
        const parsedRealBpm = Number.parseFloat(String(debouncedMetadata.realBpm ?? '').trim());
        return Number.isFinite(parsedRealBpm) ? parsedRealBpm : baseSong.realBpm;
      })(),
      title: debouncedMetadata.title || baseSong.title,
      volume: debouncedMetadata.volume,
      year: debouncedMetadata.year || baseSong.year,
    };

    const resolvedSourceUrl = debouncedSourceUrl || baseSong.sourceUrl;
    const resolvedAuthor = debouncedAuthor || baseSong.author;
    const resolvedAuthorUrl = debouncedAuthorUrl || baseSong.authorUrl;

    return {
      ...baseSong,
      ...resolvedMetadata,
      author: resolvedAuthor,
      authorUrl: resolvedAuthorUrl,
      sourceUrl: resolvedSourceUrl,
      id: getSongId(resolvedMetadata),
    } as Song;
  }, [
    committedSong,
    conversionResult,
    debouncedAuthor,
    debouncedAuthorUrl,
    debouncedMetadata,
    debouncedSourceUrl,
    editedSong,
    initialSong,
  ]);

  return {
    conversionResult,
    duplicateCandidate,
    finalSong,
    isEdit,
  } satisfies ConvertFormDerivedValues;
}
