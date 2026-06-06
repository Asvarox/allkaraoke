import { useContext } from 'react';
import { ConvertFormDerivedContext, ConvertFormFinalSongContext } from '~/routes/convert/convert-form-context-internal';

export function useConvertFormDerivedContext() {
  const context = useContext(ConvertFormDerivedContext);

  if (!context) {
    throw new Error('useConvertFormDerivedContext must be used within ConvertForm');
  }

  return context;
}

export function useConvertFormFinalSongContext() {
  return useContext(ConvertFormFinalSongContext);
}

// Backward-compatible combined hook for existing call sites.
export function useConvertFormContext() {
  const derived = useConvertFormDerivedContext();
  const finalSong = useConvertFormFinalSongContext();

  return {
    ...derived,
    finalSong,
  };
}
