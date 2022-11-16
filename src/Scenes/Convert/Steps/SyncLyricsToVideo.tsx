import { Box } from '@mui/material';
import { NotesSection, Song } from 'interfaces';
import EditSong from 'Scenes/Edit/EditSong';

interface Props {
    onChange: (data: Song) => void;
    data?: Song;
}

export default function SyncLyricsToVideo(props: Props) {
    return (
        <Box>
            {props.data &&
                props.data.video.length < 15 &&
                !!(props.data.tracks[0].sections[0] as NotesSection).notes.length && (
                    <EditSong song={props.data} onUpdate={props.onChange} />
                )}
        </Box>
    );
}
