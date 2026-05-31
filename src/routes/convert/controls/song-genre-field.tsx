import { Autocomplete, TextField } from '@mui/material';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';

export default function SongGenreField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const genre = useWatch({ control, name: 'metadata.genre' }) ?? '';
  const songList = useSongIndex(true);

  const definedGenres = useMemo(
    () => [
      ...new Set(
        songList.data
          .map((song) => song.genre)
          .filter(Boolean)
          .map((value) => value!.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase().trim())),
      ),
    ],
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
      options={definedGenres}
      value={genre}
      onChange={(_, newValue) => setValue('metadata.genre', newValue ?? undefined, { shouldDirty: true })}
      renderInput={(params) => (
        <TextField
          {...params}
          onBlur={(event) => setValue('metadata.genre', event.target.value || undefined, { shouldDirty: true })}
          label="Song genre (optional)"
          size="small"
          data-test="song-genre"
          fullWidth
        />
      )}
    />
  );
}
