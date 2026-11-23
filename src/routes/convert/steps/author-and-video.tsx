import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import YouTube, { YouTubeProps } from 'react-youtube';

import { Icon } from '~/modules/elements/akui/icon';
import { getVideoId } from '~/modules/songs/utils/convert-txt-to-song';
import { inputAction } from '~/routes/convert/elements';

export interface AuthorAndVidEntity {
  author: string;
  authorUrl: string;
  video: string;
}

// Without it the iframe gets fixed 640x390 size and overflows narrow screens
const playerOpts: YouTubeProps['opts'] = { width: '100%', height: '100%' };

interface Props {
  onChange: (data: AuthorAndVidEntity) => void;
  data: AuthorAndVidEntity;
  songTitle?: string;
  songArtist?: string;
}

export default function AuthorAndVideo(props: Props) {
  const searchForVideo = () => {
    global.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(props?.songArtist + ' ' + props?.songTitle)}`,
      '_blank',
    );
  };
  const isSearchableForVideo = !!props.songTitle && !!props.songArtist;

  const videoId = getVideoId(props.data.video);

  const canPaste = typeof navigator !== 'undefined' && !!navigator.clipboard?.readText;
  const pasteFromClipboard = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) props.onChange({ ...props.data, video: text });
    } catch (e) {
      console.warn('Could not read the clipboard', e);
    }
  };
  const pasteButton = canPaste && (
    <Tooltip title="Replace with the link from the clipboard">
      <IconButton
        data-test="video-url-paste"
        aria-label="Paste from clipboard"
        color="secondary"
        onClick={pasteFromClipboard}>
        <Icon icon="ic:baseline-content-paste" />
      </IconButton>
    </Tooltip>
  );

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
          helperText="Link to YouTube video, eg https://www.youtube.com/watch?v=xxxxxxxxx or https://youtu.be/xxxxxxxxx. Use the search button to look for it on YouTube"
          name="videoUrl"
          {...inputAction(searchForVideo, isSearchableForVideo, 'Lookup', pasteButton)}
        />
      </Box>
      {videoId && (
        <div className="mt-2 aspect-video w-full min-w-0">
          <YouTube videoId={videoId} opts={playerOpts} className="size-full" iframeClassName="size-full" />
        </div>
      )}
    </Box>
  );
}
