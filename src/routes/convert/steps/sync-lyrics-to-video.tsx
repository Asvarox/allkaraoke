import { Box } from '@mui/material';
import { Song } from '~/interfaces';
import EditSong from '~/routes/convert/steps/sync-lyrics-to-video/edit-song';

interface Props {
  onChange: (data: Song) => void;
  data?: Song;
  visible: boolean;
}

export default function SyncLyricsToVideo(props: Props) {
  'use no memo'; // React Compiler: this wrapper's own props are stable across most parent re-renders, so when compiled it bails out and stops the "incidental" re-renders that EditSong relies on to notice its player ref has been attached.
  return (
    <Box data-test="sync-lyrics">
      {props.data && props.data.video.length < 15 && !!props.data.tracks?.[0]?.sections?.length && (
        <EditSong song={props.data} onUpdate={props.onChange} visible={props.visible} />
      )}
    </Box>
  );
}
