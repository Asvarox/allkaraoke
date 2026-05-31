import { PropsWithChildren, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Song } from '~/interfaces';
import {
  ConvertFormDerivedContextProvider,
  ConvertFormFinalSongContextProvider,
  ConvertFormValues,
} from '~/routes/convert/convert-form-context';
import useConvertFormDerived from '~/routes/convert/hooks/use-convert-form-derived';
import { ConvertFormSyncProvider } from '~/routes/convert/hooks/use-convert-form-sync';

interface ConvertFormProps extends PropsWithChildren {
  initialSong?: Song;
}

function isEmptyValue<T>(value: T | T[] | undefined) {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'string') {
    return value === '';
  }

  return false;
}

function getDefaultValues(song?: Song): ConvertFormValues {
  return {
    authorAndVideo: {
      author: song?.author ?? '',
      authorUrl: song?.authorUrl ?? '',
      video: song?.video ? `https://www.youtube.com/watch?v=${song.video}` : '',
    },
    basicData: {
      sourceUrl: song?.sourceUrl ?? '',
      txtInput: '',
    },
    committedSong: song,
    editedSong: song,
    metadata: {
      artist: song?.artist ?? '',
      artistOrigin: song?.artistOrigin,
      edition: song?.edition,
      genre: song?.genre,
      language: song?.language ?? [],
      previewEnd: song?.previewEnd ?? undefined,
      previewStart: song?.previewStart ?? undefined,
      realBpm: song?.realBpm ? String(song.realBpm) : '',
      title: song?.title ?? '',
      volume: song?.volume ?? 0.7,
      year: song?.year ?? '',
    },
    sync: {
      changeRecords: [],
      gapShift: '0',
      lyricChanges: {},
      overrideBpm: song?.bpm ?? 0,
      trackNames: song?.tracks?.map((track) => track.name ?? undefined) ?? [],
      videoGapShift: 0,
    },
    txt: {
      canonical: '',
      draftDirty: false,
      parseError: undefined,
    },
  };
}

export default function ConvertForm({ children, initialSong }: ConvertFormProps) {
  const methods = useForm<ConvertFormValues>({
    defaultValues: getDefaultValues(initialSong),
  });
  const derived = useConvertFormDerived({ control: methods.control, initialSong });
  const finalSong = derived.finalSong;
  const derivedContextValue = useMemo(
    () => ({
      conversionResult: derived.conversionResult,
      duplicateCandidate: derived.duplicateCandidate,
      isEdit: derived.isEdit,
    }),
    [derived.conversionResult, derived.duplicateCandidate, derived.isEdit],
  );

  useEffect(() => {
    const conversionResult = derived.conversionResult;

    if (!conversionResult) {
      return;
    }

    const currentAuthorAndVideo = methods.getValues('authorAndVideo');
    const currentBasicData = methods.getValues('basicData');
    const currentMetadata = methods.getValues('metadata');

    if (conversionResult.video && !currentAuthorAndVideo.video) {
      methods.setValue('authorAndVideo.video', `https://www.youtube.com/watch?v=${conversionResult.video}`);
    }

    if (conversionResult.author && !currentAuthorAndVideo.author) {
      methods.setValue('authorAndVideo.author', conversionResult.author || '');
      methods.setValue('authorAndVideo.authorUrl', conversionResult.authorUrl || '');
    }

    if (conversionResult.sourceUrl && !currentBasicData.sourceUrl) {
      methods.setValue('basicData.sourceUrl', conversionResult.sourceUrl);
    }

    (
      [
        'year',
        'language',
        'realBpm',
        'genre',
        'artist',
        'title',
        'volume',
        'previewStart',
        'previewEnd',
        'artistOrigin',
      ] as const
    ).forEach((property) => {
      const hasValue =
        conversionResult[property] !== undefined &&
        conversionResult[property] !== null &&
        (typeof conversionResult[property] !== 'string' || conversionResult[property] !== '');

      if (hasValue && isEmptyValue(currentMetadata[property])) {
        methods.setValue(`metadata.${property}`, conversionResult[property]);
      }
    });
  }, [derived.conversionResult, methods]);

  return (
    <FormProvider {...methods}>
      <ConvertFormDerivedContextProvider value={derivedContextValue}>
        <ConvertFormFinalSongContextProvider value={finalSong}>
          <ConvertFormSyncProvider>{children}</ConvertFormSyncProvider>
        </ConvertFormFinalSongContextProvider>
      </ConvertFormDerivedContextProvider>
    </FormProvider>
  );
}
