import styled from '@emotion/styled';
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { Flag } from 'modules/Elements/Flag';
import useSongIndex from 'modules/Songs/hooks/useSongIndex';
import { countryMap } from 'modules/utils/countryList';
import { useEffect, useMemo, useState } from 'react';
import { inputAction } from 'routes/Convert/Elements';
import PreviewAndVolumeAdjustment from 'routes/Convert/Steps/PreviewAndVolumeAdjustment';

export interface SongMetadataEntity {
  artist: string;
  title: string;
  year: string;
  realBpm: string;
  language: string[];
  artistOrigin?: string;
  volume: number;
  previewStart: number | undefined;
  previewEnd: number | undefined;
  genre?: string;
  edition?: string;
}

interface Props {
  onChange: (data: SongMetadataEntity) => void;
  data: SongMetadataEntity;
  songTitle?: string;
  songArtist?: string;
  videoId: string;
  videoGap?: number;
}

const useDefaultArtistOrigin = (artist: string) => {
  const songList = useSongIndex(true);

  return useMemo(() => {
    const artistOrigin = songList.data
      .filter((song) => song.artist === artist)
      .map((song) => song.artistOrigin)
      .filter(Boolean)
      .reduce(
        // find the most common origin for the artist
        (acc, origin) => {
          if (acc[origin!]) {
            acc[origin!]++;
          } else {
            acc[origin!] = 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      );
    return Object.entries(artistOrigin).sort((a, b) => b[1] - a[1])?.[0]?.[0] ?? '';
  }, [artist, songList.data]);
};

export default function SongMetadata(props: Props) {
  const songList = useSongIndex(true);
  const defaultArtistOrigin = useDefaultArtistOrigin(props.songArtist ?? '');

  useEffect(() => {
    if (props.data.artistOrigin === undefined) {
      console.log('props.data.artistOrigin', defaultArtistOrigin);
      props.onChange({ ...props.data, artistOrigin: defaultArtistOrigin });
    }
  }, [defaultArtistOrigin, props.data]);

  const definedLanguages = useMemo(
    () => [
      ...new Set(
        songList.data
          .map(({ language }) => (Array.isArray(language) ? language : [language]))
          .flat()
          .filter(Boolean),
      ),
    ],
    [songList.data],
  );

  // todo find artist origin based on their other songs
  const definedArtistOrigins = countryMap;

  const definedGenres = useMemo(
    () => [
      ...new Set(
        songList.data
          .map((song) => song.genre)
          .filter(Boolean)
          .map((genre) => genre!.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase().trim())),
      ),
    ],
    [songList.data],
  );
  const definedEditions = useMemo(
    () =>
      [
        ...new Set(
          songList.data
            .map((song) => song.edition)
            .filter(Boolean)
            .map((edition) => edition!.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase().trim())),
        ),
      ].sort(),
    [songList.data],
  );

  const searchGoogle = (phrase: string) => {
    global.open(
      `https://www.google.com/search?q=${encodeURIComponent(`${props.songArtist} ${props.songTitle} ${phrase}`)}`,
      '_blank',
    );
  };
  const isSearchableForVideo = !!props.songTitle && !!props.songArtist;
  const isRealBpmInvalid = +(props.data?.realBpm ?? 0) > 200;

  const [hasSearchedBpm, setHasSearchedBpm] = useState(false);

  return (
    <Grid container spacing={2} data-test="song-metadata">
      <Grid item xs={6}>
        <TextField
          value={props.data.artist}
          onChange={(e) => props.onChange({ ...props.data, artist: e.target.value })}
          label="Song artist"
          size="small"
          data-test="song-artist"
          required
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          value={props.data.title}
          onChange={(e) => props.onChange({ ...props.data, title: e.target.value })}
          label="Song title"
          fullWidth
          size="small"
          required
          data-test="song-title"
        />
      </Grid>
      <Grid item xs={3}>
        <Autocomplete
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
            }
          }}
          freeSolo
          disableClearable
          options={definedGenres}
          value={props.data.genre ?? ''}
          onChange={(_, newValue) => props.onChange({ ...props.data, genre: newValue })}
          renderInput={(params) => (
            <TextField
              {...params}
              onBlur={(e) => props.onChange({ ...props.data, genre: e.target.value })}
              label="Song genre (optional)"
              size="small"
              data-test="song-genre"
              fullWidth
            />
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <Autocomplete
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
            }
          }}
          freeSolo
          disableClearable
          options={definedEditions}
          value={props.data.edition ?? ''}
          onChange={(_, newValue) => props.onChange({ ...props.data, edition: newValue })}
          renderInput={(params) => (
            <TextField
              {...params}
              onBlur={(e) => props.onChange({ ...props.data, edition: e.target.value })}
              label="Song edition (optional)"
              size="small"
              data-test="song-edition"
              helperText="Songs with the same theme, e.g. 'Christmas'"
              fullWidth
            />
          )}
        />
      </Grid>
      <Grid item xs={3}>
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
          value={typeof props.data.language === 'string' ? [props.data.language] : props.data.language}
          onChange={(_, newValue) => {
            props.onChange({
              ...props.data,
              language: newValue ? (newValue.filter(Boolean) as string[]) : props.data.language,
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Song language"
              fullWidth
              size="small"
              required={!props.data.language?.length}
              data-test="song-language"
            />
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <FormControl fullWidth>
          <InputLabel id="song-origin-select-label" size="small">
            Song/artist origin (optional)
          </InputLabel>
          <Select
            data-test="artist-origin"
            size="small"
            labelId="song-origin-select-label"
            id="song-origin-select"
            value={props.data.artistOrigin ?? ''}
            label="Song/artist origin (optional)"
            onChange={(e) => props.onChange({ ...props.data, artistOrigin: e.target.value })}>
            <MenuItem key={'none'} value="">
              None
            </MenuItem>
            {Object.entries(definedArtistOrigins).map(([code, name]) => (
              <MenuItem key={code} value={code}>
                <CountryFlag isocode={code} /> {name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Used to show the flag on the list</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <TextField
          data-test="release-year"
          value={props.data.year}
          onChange={(e) => props.onChange({ ...props.data, year: e.target.value })}
          label="Release year"
          helperText="The year the song was released. Click the 'Lookup' button to look for it on Google"
          fullWidth
          size="small"
          required
          {...inputAction(() => searchGoogle('release year'), isSearchableForVideo)}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          data-test="song-bpm"
          value={props.data.realBpm}
          onChange={(e) => props.onChange({ ...props.data, realBpm: e.target.value })}
          label="Song (real) BPM"
          focused={isRealBpmInvalid ? true : undefined}
          helperText={
            isRealBpmInvalid ? (
              <>
                Usually songs don&#39;t have higher BPM than <b>200</b>. Make sure the value is correct (you can still
                save the song)
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
            searchGoogle('tempo');
          }, isSearchableForVideo)}
        />
      </Grid>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <PreviewAndVolumeAdjustment {...props} />
      </Grid>
    </Grid>
  );
}

const CountryFlag = styled(Flag)`
  width: 1em;
  margin-right: 0.5em;
  display: inline-block;
`;
