import { Autocomplete, Grid, TextField } from '@mui/material';
import { inputAction } from 'Scenes/Convert/Elements';
import PreviewAndVolumeAdjustment from 'Scenes/Convert/Steps/PreviewAndVolumeAdjustment';
import useSongIndex from 'Songs/hooks/useSongIndex';
import { useMemo } from 'react';

export interface SongMetadataEntity {
  artist: string;
  title: string;
  year: string;
  realBpm: string;
  language: string | string[];
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

export default function SongMetadata(props: Props) {
  const songList = useSongIndex(true);

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
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(`${props.songArtist} ${props.songTitle} ${phrase}`)}`,
      '_blank',
    );
  };
  const isSearchableForVideo = !!props.songTitle && !!props.songArtist;

  return (
    <Grid container spacing={2} sx={{ mt: 6 }}>
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
          onChange={(e, newValue) => props.onChange({ ...props.data, genre: newValue })}
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
          onChange={(e, newValue) => props.onChange({ ...props.data, edition: newValue })}
          renderInput={(params) => (
            <TextField
              {...params}
              onBlur={(e) => props.onChange({ ...props.data, genre: e.target.value })}
              label="Song edition (optional)"
              size="small"
              data-test="song-edition"
              helperText="Songs with the same theme, e.g. 'Christmas'"
              fullWidth
            />
          )}
        />
      </Grid>
      <Grid item xs={6}>
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
          onChange={(e, newValue) => {
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
          helperText="The actual tempo of the song. Click the 'Lookup' button to look for it on Google"
          fullWidth
          type="number"
          size="small"
          required
          {...inputAction(() => searchGoogle('tempo'), isSearchableForVideo)}
        />
      </Grid>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <PreviewAndVolumeAdjustment {...props} />
      </Grid>
    </Grid>
  );
}
