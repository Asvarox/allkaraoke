import { Box, Button, TextField, Tooltip } from '@mui/material';
import YouTube from 'react-youtube';
import { getVideoId } from 'Scenes/Convert/convertTxtToSong';

export interface AuthorAndVidEntity {
    author: string;
    authorUrl: string;
    video: string;
}

interface Props {
    onChange: (data: AuthorAndVidEntity) => void;
    data: AuthorAndVidEntity;
    songTitle?: string;
    songArtist?: string;
}

export default function AuthorAndVid(props: Props) {
    const searchForVideo = () => {
        window.open(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(
                props?.songArtist + ' ' + props?.songTitle,
            )}`,
            '_blank',
        );
    };
    const isSearchableForVideo = !!props.songTitle && !!props.songArtist;

    const videoId = getVideoId(props.data.video);

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }} data-test="author-and-vid">
            <TextField
                data-test="author-name"
                sx={{ mt: 2 }}
                value={props.data.author}
                onChange={(e) => props.onChange({ ...props.data, author: e.target.value })}
                label="Author name"
                fullWidth
                size="small"
            />
            <TextField
                data-test="author-url"
                sx={{ mt: 2 }}
                value={props.data.authorUrl}
                onChange={(e) => props.onChange({ ...props.data, authorUrl: e.target.value })}
                label="Author URL"
                fullWidth
                size="small"
            />
            <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2, alignItems: 'center', width: '100%' }}>
                <TextField
                    data-test="video-url"
                    required
                    value={props.data.video}
                    onChange={(e) => props.onChange({ ...props.data, video: e.target.value })}
                    label="Video URL"
                    fullWidth
                    size="small"
                    helperText="Link to YouTube video, eg https://www.youtube.com/watch?v=xxxxxxxxx"
                    name="videoUrl"
                    InputProps={{
                        endAdornment: (
                            <Tooltip
                                title={
                                    isSearchableForVideo
                                        ? 'Open YouTube search results for the song'
                                        : 'Artist or title of the song is unknown'
                                }>
                                <span>
                                    <Button
                                        data-test="search-video"
                                        color={'secondary'}
                                        variant={'contained'}
                                        onClick={searchForVideo}
                                        disabled={!isSearchableForVideo}>
                                        Search&nbsp;for&nbsp;video
                                    </Button>
                                </span>
                            </Tooltip>
                        ),
                    }}
                />
            </Box>
            {videoId && (
                <Box>
                    <YouTube videoId={videoId} />
                </Box>
            )}
        </Box>
    );
}
