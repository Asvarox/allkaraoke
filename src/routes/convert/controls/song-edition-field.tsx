import { Autocomplete, TextField } from '@mui/material';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';

export default function SongEditionField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const edition = useWatch({ control, name: 'metadata.edition' }) ?? '';
  const songList = useSongIndex(true);

  const definedEditions = useMemo(
    () =>
      [
        ...new Set(
          songList.data
            .map((song) => song.edition)
            .filter(Boolean)
            .map((value) => value!.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase().trim())),
        ),
      ].sort(),
    [songList.data],
  );

  return (
    <Autocomplete
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
        }
      }}
      freeSolo
      disableClearable
      options={definedEditions}
      value={edition}
      onChange={(_, newValue) => setValue('metadata.edition', newValue ?? undefined, { shouldDirty: true })}
      renderInput={(params) => (
        <TextField
          {...params}
          onBlur={(event) => setValue('metadata.edition', event.target.value || undefined, { shouldDirty: true })}
          label="Song edition (optional)"
          size="small"
          data-test="song-edition"
          helperText="Songs with the same theme, e.g. 'Christmas'"
          fullWidth
        />
      )}
    />
  );
}
