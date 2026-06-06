import { useFormContext } from 'react-hook-form';
import { Song } from '~/interfaces';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import { applySyncDeltas } from '~/routes/convert/controls/sync-editor-utils';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';
import isValidUltrastarTxtFormat from '~/routes/convert/steps/utils/validate-ultrastar';

function toVideoUrl(videoId: string) {
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
}

function toMetadataValues(song: Song): ConvertFormValues['metadata'] {
  return {
    artist: song.artist,
    artistOrigin: song.artistOrigin,
    edition: song.edition,
    genre: song.genre,
    language: song.language,
    previewEnd: song.previewEnd,
    previewStart: song.previewStart,
    realBpm: song.realBpm ? String(song.realBpm) : '',
    title: song.title,
    volume: song.volume ?? 70,
    year: song.year ?? '',
  };
}

export default function useApplyTxtFlow() {
  const { getValues, setValue } = useFormContext<ConvertFormValues>();

  const applyDraftTxt = ({ withDeltas = false }: { withDeltas?: boolean } = {}) => {
    const draftTxt = getValues('basicData.txtInput');
    const sourceUrl = getValues('basicData.sourceUrl');
    const currentAuthorAndVideo = getValues('authorAndVideo');
    const sync = getValues('sync');

    try {
      if (!isValidUltrastarTxtFormat(draftTxt)) {
        throw new Error('This does not look like a valid UltraStar TXT file');
      }

      let parsedSong = convertTxtToSong(
        draftTxt,
        currentAuthorAndVideo.video,
        currentAuthorAndVideo.author,
        currentAuthorAndVideo.authorUrl,
        sourceUrl,
      );

      if (withDeltas) {
        parsedSong = applySyncDeltas({
          baseSong: parsedSong,
          changeRecords: sync.changeRecords,
          gapShift: sync.gapShift,
          lyricChanges: sync.lyricChanges,
          overrideBpm: sync.overrideBpm,
          trackNames: sync.trackNames,
          videoGapShift: sync.videoGapShift,
        });
      }

      setValue('committedSong', parsedSong, { shouldDirty: true });
      setValue('editedSong', undefined, { shouldDirty: true });
      setValue(
        'authorAndVideo',
        {
          author: parsedSong.author ?? '',
          authorUrl: parsedSong.authorUrl ?? '',
          video: toVideoUrl(parsedSong.video),
        },
        { shouldDirty: true },
      );
      setValue('metadata', toMetadataValues(parsedSong), { shouldDirty: true });
      setValue('basicData.sourceUrl', parsedSong.sourceUrl ?? sourceUrl, { shouldDirty: true });
      setValue('sync.overrideBpm', parsedSong.bpm, { shouldDirty: true });
      setValue('txt.parseError', undefined);

      if (withDeltas) {
        setValue('sync.gapShift', '0', { shouldDirty: true });
        setValue('sync.videoGapShift', 0, { shouldDirty: true });
        setValue('sync.changeRecords', [], { shouldDirty: true });
        setValue(
          'sync.trackNames',
          parsedSong.tracks.map((track) => track.name ?? undefined),
          { shouldDirty: true },
        );
        setValue('sync.lyricChanges', {}, { shouldDirty: true });
      }

      return { ok: true as const, song: parsedSong };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid UltraStar TXT';
      setValue('txt.parseError', message);
      return { ok: false as const, error: message };
    }
  };

  return {
    applyDraftTxt,
  };
}
