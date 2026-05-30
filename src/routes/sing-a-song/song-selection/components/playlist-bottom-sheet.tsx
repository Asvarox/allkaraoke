import { BottomSheet } from '~/modules/elements/akui/bottom-sheet';
import { Button } from '~/modules/elements/akui/button';
import { PlaylistEntry } from '~/routes/sing-a-song/song-selection/hooks/use-playlists';

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
