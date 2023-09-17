import { Box, TextField } from '@mui/material';
import { inputAction } from 'Scenes/Convert/Elements';
import { getVideoId } from 'Songs/utils/convertTxtToSong';
import YouTube from 'react-youtube';

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
      `https://www.youtube.com/results?search_query=${encodeURIComponent(props?.songArtist + ' ' + props?.songTitle)}`,
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
        label="Author name (optional)"
        fullWidth
        size="small"
        helperText="Nickname of the person that created the .txt file."
      />
      <TextField
        data-test="author-url"
        sx={{ mt: 2 }}
        value={props.data.authorUrl}
        onChange={(e) => props.onChange({ ...props.data, authorUrl: e.target.value })}
        label="Author URL (optional)"
        helperText="Link to authors page/profile."
        fullWidth
        size="small"
      />
      <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2, alignItems: 'center', width: '100%' }}>
        <TextField
          data-test="video-url"
          required
          value={props.data.video}
          onChange={(e) => props.onChange({ ...props.data, video: e.target.value })}
          label="YouTube Video URL"
          placeholder="https://www.youtube.com/watch?v="
          fullWidth
          size="small"
          helperText="Link to YouTube video, eg https://www.youtube.com/watch?v=xxxxxxxxx. Click the 'Lookup' button to look for it on YouTube"
          name="videoUrl"
          {...inputAction(searchForVideo, isSearchableForVideo)}
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
