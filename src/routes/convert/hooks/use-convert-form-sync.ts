import { createContext, createElement, PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import convertSongToTxt from '~/modules/songs/utils/convert-song-to-txt';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';
import { useConvertFormFinalSongContext } from '~/routes/convert/convert-form-context-hooks';
import useApplyTxtFlow from '~/routes/convert/hooks/use-apply-txt-flow';
import isValidUltrastarTxtFormat from '~/routes/convert/steps/utils/validate-ultrastar';

interface ConvertFormSyncValue {
  applyDraftTxt: (options?: {
    withDeltas?: boolean;
  }) => { ok: true; song: ConvertFormValues['editedSong'] } | { ok: false; error: string };
  canonicalTxt: string;
  draftDirty: boolean;
  draftTxt: string;
  hasPendingSyncDeltas: boolean;
  onStructuredFieldChange: (name: 'metadata.artist' | 'metadata.title' | 'basicData.sourceUrl', value: string) => void;
  parseError: string | undefined;
  revertDraftTxt: () => void;
  setDraftTxt: (value: string) => void;
}

const ConvertFormSyncContext = createContext<ConvertFormSyncValue | null>(null);

export function ConvertFormSyncProvider({ children }: PropsWithChildren) {
  const finalSong = useConvertFormFinalSongContext();
  const { control, getValues, setValue } = useFormContext<ConvertFormValues>();
  const { applyDraftTxt: applyDraftTxtInternal } = useApplyTxtFlow();
  const draftTxt = useWatch({ control, name: 'basicData.txtInput' });
  const committedSong = useWatch({ control, name: 'committedSong' });
  const sync = useWatch({ control, name: 'sync' });
  const txt = useWatch({ control, name: 'txt' });

  const hasPendingSyncDeltas =
    sync.gapShift !== '0' ||
    sync.videoGapShift !== 0 ||
    !!sync.changeRecords.length ||
    !!Object.keys(sync.lyricChanges).length ||
    sync.trackNames.some(Boolean) ||
    (!!committedSong && sync.overrideBpm !== committedSong.bpm);

  useEffect(() => {
    const currentCanonical = getValues('txt.canonical');
    let nextCanonical = '';

    if (finalSong) {
      try {
        nextCanonical = convertSongToTxt(finalSong);
      } catch (_error) {
        nextCanonical = currentCanonical;
      }
    }

    if (nextCanonical === currentCanonical) {
      return;
    }

    setValue('txt.canonical', nextCanonical);
    setValue('basicData.txtInput', nextCanonical);
    setValue('txt.draftDirty', false);
    setValue('txt.parseError', undefined);
  }, [finalSong, getValues, setValue]);

  const value = useMemo<ConvertFormSyncValue>(
    () => ({
      applyDraftTxt: applyDraftTxtInternal,
      canonicalTxt: txt.canonical,
      draftDirty: txt.draftDirty,
      draftTxt,
      hasPendingSyncDeltas,
      onStructuredFieldChange: (name, nextValue) => {
        setValue(name, nextValue as never, { shouldDirty: true });
      },
      parseError: txt.parseError,
      revertDraftTxt: () => {
        setValue('basicData.txtInput', getValues('txt.canonical'), { shouldDirty: true });
        setValue('txt.draftDirty', false);
        setValue('txt.parseError', undefined);
      },
      setDraftTxt: (nextValue) => {
        const previousDraft = getValues('basicData.txtInput');
        const hasCommittedSong = !!getValues('committedSong');
        const isFirstTxtPaste = !previousDraft.trim().length && !!nextValue.trim().length;

        setValue('basicData.txtInput', nextValue, { shouldDirty: true });
        setValue('txt.draftDirty', nextValue !== getValues('txt.canonical'));
        setValue('txt.parseError', undefined);

        // Keep explicit apply for edits, but auto-commit the initial valid TXT import.
        if (!hasCommittedSong && isFirstTxtPaste && isValidUltrastarTxtFormat(nextValue)) {
          applyDraftTxtInternal();
        }
      },
    }),
    [
      applyDraftTxtInternal,
      draftTxt,
      getValues,
      hasPendingSyncDeltas,
      setValue,
      txt.canonical,
      txt.draftDirty,
      txt.parseError,
    ],
  );

  return createElement(ConvertFormSyncContext.Provider, { value }, children);
}

export function useConvertFormSync() {
  const context = useContext(ConvertFormSyncContext);

  if (!context) {
    throw new Error('useConvertFormSync must be used within ConvertFormSyncProvider');
  }

  return context;
}
