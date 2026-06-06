import { TextField } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';

export default function SongTitleField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const title = useWatch({ control, name: 'metadata.title' });

  return (
    <TextField
      value={title}
      onChange={(event) => setValue('metadata.title', event.target.value, { shouldDirty: true })}
      label="Song title"
      fullWidth
      size="small"
      required
      data-test="song-title"
    />
  );
}
