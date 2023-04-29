import { Autocomplete, Grid, TextField } from '@mui/material';
import VolumeAdjustment from 'Scenes/Convert/Steps/VolumeAdjustment';
import { inputAction } from 'Scenes/Convert/Elements';
import useSongIndex from 'Songs/hooks/useSongIndex';
import { useMemo } from 'react';

export interface SongMetadataEntity {
    artist: string;
    title: string;
    year: string;
    realBpm: string;
    language: string;
    volume: number;
    genre?: string;
}

interface Props {
    onChange: (data: SongMetadataEntity) => void;
    data: SongMetadataEntity;
    songTitle?: string;
    songArtist?: string;
    videoId: string;
}

export default function SongMetadata(props: Props) {
    const songList = useSongIndex(true);

    const definedLanguages = useMemo(
        () => [...new Set(songList.data.map((song) => song.language).filter(Boolean))],
        [songList.data],
    );
    const definedGenres = useMemo(
        () => [...new Set(songList.data.map((song) => song.genre).filter(Boolean))],
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
            <Grid item xs={6}>
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
            <Grid item xs={6}>
                <Autocomplete
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                        }
                    }}
                    freeSolo
                    disableClearable
                    options={definedLanguages}
                    value={props.data.language}
                    onChange={(e, newValue) => props.onChange({ ...props.data, language: newValue })}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            onBlur={(e) => props.onChange({ ...props.data, language: e.target.value })}
                            label="Song language"
                            fullWidth
                            size="small"
                            required
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
            <Grid item xs={12}>
                <VolumeAdjustment {...props} />
            </Grid>
        </Grid>
    );
}
