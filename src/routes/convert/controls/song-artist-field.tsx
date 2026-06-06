import { TextField } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';

export default function SongArtistField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const artist = useWatch({ control, name: 'metadata.artist' });

  return (
    <TextField
      value={artist}
      onChange={(event) => setValue('metadata.artist', event.target.value, { shouldDirty: true })}
      label="Song artist"
      size="small"
      data-test="song-artist"
      required
      fullWidth
    />
  );
}
