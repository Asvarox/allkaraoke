import { TextField } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';
import { useConvertFormFinalSongContext } from '~/routes/convert/convert-form-context-hooks';
import { inputAction } from '~/routes/convert/elements';

export default function ReleaseYearField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const finalSong = useConvertFormFinalSongContext();
  const year = useWatch({ control, name: 'metadata.year' });
  const isSearchable = !!finalSong?.title && !!finalSong?.artist;

  const searchGoogle = () => {
    global.open(
      `https://www.google.com/search?q=${encodeURIComponent(`${finalSong?.artist ?? ''} ${finalSong?.title ?? ''} release year`)}`,
      '_blank',
    );
  };

  return (
    <TextField
      data-test="release-year"
      value={year}
      onChange={(event) => setValue('metadata.year', event.target.value, { shouldDirty: true })}
      label="Release year"
      helperText="The year the song was released. Click the 'Lookup' button to look for it on Google"
      fullWidth
      size="small"
      required
      {...inputAction(searchGoogle, isSearchable)}
    />
  );
}
