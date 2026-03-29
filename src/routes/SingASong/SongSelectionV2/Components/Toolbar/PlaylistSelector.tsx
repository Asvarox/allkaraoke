import { ExpandMore } from '@mui/icons-material';
import { useState } from 'react';
import { Button } from '~/modules/Elements/AKUI/Button';
import { ScrollableRow } from '~/modules/Elements/AKUI/Selector';
import { RegisterFunc } from '~/modules/hooks/useKeyboardNav';
import PlaylistBottomSheet from '~/routes/SingASong/SongSelectionV2/Components/PlaylistBottomSheet';
import { PlaylistEntry } from '~/routes/SingASong/SongSelectionV2/Hooks/usePlaylists';

interface PlaylistSelectorProps {
  playlists: PlaylistEntry[];
  selectedPlaylist: string | null;
  setSelectedPlaylist: (name: string) => void;
  /** True when screen is smaller than md (768px) — uses bottom-sheet instead of tab row */
  mobile: boolean;
  keyboardNavRegister?: RegisterFunc;
  onPlaylistSelected?: () => void;
}

export default function PlaylistSelector({
  playlists,
  selectedPlaylist,
  setSelectedPlaylist,
  mobile,
  keyboardNavRegister,
  onPlaylistSelected,
}: PlaylistSelectorProps) {
  const [playlistSheetOpen, setPlaylistSheetOpen] = useState(false);

  if (mobile) {
    return (
      <>
        <Button
          size="small"
          type="button"
          className="ml-auto flex-1 animate-none justify-between"
          data-test="playlist-picker-trigger"
          {...keyboardNavRegister?.('playlist-trigger', () => setPlaylistSheetOpen(true), 'Playlists')}
          onClick={() => setPlaylistSheetOpen(true)}>
          <span>{playlists.find((p) => p.name === selectedPlaylist)?.display ?? selectedPlaylist ?? 'All'}</span>
          <ExpandMore className="h-5! w-5!" />
        </Button>
        <PlaylistBottomSheet
          playlists={playlists}
          selectedPlaylist={selectedPlaylist}
          onSelect={(name) => {
            setSelectedPlaylist(name);
            setPlaylistSheetOpen(false);
            onPlaylistSelected?.();
          }}
          open={playlistSheetOpen}
          onClose={() => setPlaylistSheetOpen(false)}
        />
      </>
    );
  }

  return (
    <ScrollableRow className="ml-auto flex-1">
      {playlists.map((playlist) => {
        const playlistNavProps = keyboardNavRegister?.(
          `playlist-${playlist.name}`,
          () => {
            setSelectedPlaylist(playlist.name);
            onPlaylistSelected?.();
          },
          String(playlist.display ?? playlist.name),
        );
        return (
          <Button
            key={playlist.name}
            size="small"
            className="shrink-0 scale-100! animate-none px-3"
            focused={playlist.name === selectedPlaylist || (playlistNavProps?.focused ?? false)}
            data-test={`playlist-${playlist.name}`}
            onClick={() => setSelectedPlaylist(playlist.name)}>
            {playlist.display ?? playlist.name}
          </Button>
        );
      })}
    </ScrollableRow>
  );
}
