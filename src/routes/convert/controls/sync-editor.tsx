import { Song } from '~/interfaces';
import EditSong from '~/routes/convert/steps/sync-lyrics-to-video/edit-song';

interface SyncEditorProps {
  song: Song;
  visible: boolean;
}

export default function SyncEditor({ song, visible }: SyncEditorProps) {
  return <EditSong song={song} visible={visible} />;
}
