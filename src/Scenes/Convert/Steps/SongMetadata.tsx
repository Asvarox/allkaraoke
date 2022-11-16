import { Box, Button, TextField } from '@mui/material';

export interface SongMetadataEntity {
    year: string;
    realBpm: string;
    language: string;
}

interface Props {
    onChange: (data: SongMetadataEntity) => void;
    data: SongMetadataEntity;
    songTitle?: string;
    songArtist?: string;
}

export default function SongMetadata(props: Props) {
    const searchGoogle = (phrase: string) => {
        window.open(
            `https://www.google.com/search?q=${encodeURIComponent(`${props.songArtist} ${props.songTitle} ${phrase}`)}`,
            '_blank',
        );
    };
    const isSearchableForVideo = !!props.songTitle && !!props.songArtist;

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <TextField
                sx={{ mt: 2 }}
                value={props.data.language}
                onChange={(e) => props.onChange({ ...props.data, language: e.target.value })}
                label="Song language"
                fullWidth
                size="small"
                required
            />
            <TextField
                sx={{ mt: 2 }}
                value={props.data.year}
                onChange={(e) => props.onChange({ ...props.data, year: e.target.value })}
                label="Release year"
                fullWidth
                size="small"
                required
                InputProps={{
                    endAdornment: (
                        <Button
                            color="secondary"
                            variant={'contained'}
                            onClick={() => searchGoogle('release year')}
                            disabled={!isSearchableForVideo}>
                            Search&nbsp;for&nbsp;year
                        </Button>
                    ),
                }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2, alignItems: 'center', width: '100%' }}>
                <TextField
                    value={props.data.realBpm}
                    onChange={(e) => props.onChange({ ...props.data, realBpm: e.target.value })}
                    label="Song (real) BPM"
                    fullWidth
                    type="number"
                    size="small"
                    required
                    InputProps={{
                        endAdornment: (
                            <Button
                                color={'secondary'}
                                variant={'contained'}
                                onClick={() => searchGoogle('tempo')}
                                disabled={!isSearchableForVideo}>
                                Search&nbsp;for&nbsp;tempo
                            </Button>
                        ),
                    }}
                />
            </Box>
        </Box>
    );
}
