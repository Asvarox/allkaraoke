import { BottomSheet } from '~/modules/Elements/AKUI/BottomSheet';
import { Button } from '~/modules/Elements/AKUI/Button';
import { PlaylistEntry } from '~/routes/SingASong/SongSelectionV2/Hooks/usePlaylists';

interface PlaylistBottomSheetProps {
  playlists: PlaylistEntry[];
  selectedPlaylist: string | null;
  onSelect: (name: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function PlaylistBottomSheet({
  playlists,
  selectedPlaylist,
  onSelect,
  open,
  onClose,
}: PlaylistBottomSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-1 pb-2">
        {playlists.map((playlist) => (
          <Button
            key={playlist.name}
            size="small"
            focused={playlist.name === selectedPlaylist}
            onClick={() => {
              onSelect(playlist.name);
              onClose();
            }}
            className="w-full justify-start px-4"
            data-test={`playlist-sheet-${playlist.name}`}>
            {playlist.display ?? playlist.name}
          </Button>
        ))}
      </div>
    </BottomSheet>
  );
}
