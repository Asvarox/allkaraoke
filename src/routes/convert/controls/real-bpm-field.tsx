import { TextField } from '@mui/material';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';
import { useConvertFormFinalSongContext } from '~/routes/convert/convert-form-context-hooks';
import { inputAction } from '~/routes/convert/elements';

export default function RealBpmField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const finalSong = useConvertFormFinalSongContext();
  const realBpm = useWatch({ control, name: 'metadata.realBpm' });
  const [hasSearchedBpm, setHasSearchedBpm] = useState(false);
  const isSearchable = !!finalSong?.title && !!finalSong?.artist;
  const isRealBpmInvalid = +(realBpm ?? 0) > 200;

  const searchGoogle = () => {
    global.open(
      `https://www.google.com/search?q=${encodeURIComponent(`${finalSong?.artist ?? ''} ${finalSong?.title ?? ''} tempo`)}`,
      '_blank',
    );
  };

  return (
    <TextField
      data-test="song-bpm"
      value={realBpm}
      onChange={(event) => setValue('metadata.realBpm', event.target.value, { shouldDirty: true })}
      label="Song (real) BPM"
      focused={isRealBpmInvalid ? true : undefined}
      helperText={
        isRealBpmInvalid ? (
          <>
            Usually songs don&#39;t have higher BPM than <b>200</b>. Make sure the value is correct (you can still save
            the song)
          </>
        ) : (
          `The actual tempo of the song. Click the 'Lookup' button to look for it on Google. ${hasSearchedBpm ? "If you can't find it, you can still save the song" : ''}`
        )
      }
      color={isRealBpmInvalid ? 'warning' : undefined}
      fullWidth
      type="number"
      size="small"
      required={!hasSearchedBpm}
      {...inputAction(() => {
        setHasSearchedBpm(true);
        searchGoogle();
      }, isSearchable)}
    />
  );
}
