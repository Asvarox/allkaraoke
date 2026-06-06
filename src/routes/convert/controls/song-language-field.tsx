import { Autocomplete, TextField } from '@mui/material';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';

export default function SongLanguageField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const language = useWatch({ control, name: 'metadata.language' });
  const songList = useSongIndex(true);

  const definedLanguages = useMemo(
    () => [
      ...new Set(
        songList.data
          .map(({ language: songLanguage }) => (Array.isArray(songLanguage) ? songLanguage : [songLanguage]))
          .flat()
          .filter(Boolean),
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
      multiple
      freeSolo
      disableClearable
      options={definedLanguages}
      value={Array.isArray(language) ? language : []}
      onChange={(_, newValue) => {
        const languages = (newValue ?? []).filter(
          (value): value is string => typeof value === 'string' && value !== '',
        );
        setValue('metadata.language', languages, { shouldDirty: true });
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Song language"
          fullWidth
          size="small"
          required={!language?.length}
          data-test="song-language"
        />
      )}
    />
  );
}
