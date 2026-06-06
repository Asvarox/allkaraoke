import styled from '@emotion/styled';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Flag } from '~/modules/elements/flag';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import { countryMap } from '~/modules/utils/country-list';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';
import { useConvertFormFinalSongContext } from '~/routes/convert/convert-form-context-hooks';

function useDefaultArtistOrigin(artist: string) {
  const songList = useSongIndex(true);

  return useMemo(() => {
    const artistOrigin = songList.data
      .filter((song) => song.artist === artist)
      .map((song) => song.artistOrigin)
      .filter(Boolean)
      .reduce(
        (accumulator, origin) => {
          if (accumulator[origin!]) {
            accumulator[origin!]++;
          } else {
            accumulator[origin!] = 1;
          }
          return accumulator;
        },
        {} as Record<string, number>,
      );

    return Object.entries(artistOrigin).sort((a, b) => b[1] - a[1])?.[0]?.[0] ?? '';
  }, [artist, songList.data]);
}

export default function ArtistOriginField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const finalSong = useConvertFormFinalSongContext();
  const artistOrigin = useWatch({ control, name: 'metadata.artistOrigin' });
  const defaultArtistOrigin = useDefaultArtistOrigin(finalSong?.artist ?? '');

  useEffect(() => {
    if (artistOrigin === undefined) {
      setValue('metadata.artistOrigin', defaultArtistOrigin || undefined, { shouldDirty: false });
    }
  }, [artistOrigin, defaultArtistOrigin, setValue]);

  return (
    <FormControl fullWidth>
      <InputLabel id="song-origin-select-label" size="small">
        Song/artist origin (optional)
      </InputLabel>
      <Select
        data-test="artist-origin"
        size="small"
        labelId="song-origin-select-label"
        id="song-origin-select"
        value={artistOrigin ?? ''}
        label="Song/artist origin (optional)"
        onChange={(event) => setValue('metadata.artistOrigin', event.target.value || undefined, { shouldDirty: true })}>
        <MenuItem key={'none'} value="">
          None
        </MenuItem>
        {Object.entries(countryMap).map(([code, name]) => (
          <MenuItem key={code} value={code}>
            <CountryFlag isocode={code} /> {name}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>Used to show the flag on the list</FormHelperText>
    </FormControl>
  );
}

const CountryFlag = styled(Flag)`
  width: 1em;
  margin-right: 0.5em;
  display: inline-block;
`;
