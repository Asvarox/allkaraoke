import { Casino } from '@mui/icons-material';
import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '~/modules/Elements/AKUI/Button';
import useBreakpoint from '~/modules/hooks/useBreakpoint';
import { RegisterFunc } from '~/modules/hooks/useKeyboardNav';
import PlaylistSelector from '~/routes/SingASong/SongSelectionV2/Components/Toolbar/PlaylistSelector';
import SearchBar from '~/routes/SingASong/SongSelectionV2/Components/Toolbar/SearchBar';
import { PlaylistEntry } from '~/routes/SingASong/SongSelectionV2/Hooks/usePlaylists';
import { AppliedFilters } from '~/routes/SingASong/SongSelectionV2/Hooks/useSongListFilter';

interface ToolbarProps {
  filters: AppliedFilters;
  setFilters: Dispatch<SetStateAction<AppliedFilters>>;
  onRandom: () => void;
  playlists: PlaylistEntry[];
  selectedPlaylist: string | null;
  setSelectedPlaylist: (name: string) => void;
  keyboardControl: boolean;
  keyboardNavRegister?: RegisterFunc;
  onPlaylistSelected?: () => void;
  /** True while keyboard nav is active inside the toolbar — suppresses hotkeys that would interfere. */
  toolbarNavActive?: boolean;
}

export default function Toolbar({
  filters,
  setFilters,
  onRandom,
  playlists,
  selectedPlaylist,
  setSelectedPlaylist,
  keyboardControl,
  keyboardNavRegister,
  onPlaylistSelected,
  toolbarNavActive = false,
}: ToolbarProps) {
  const breakpoint = useBreakpoint();
  // Screens smaller than md (768px) use the mobile layout
  const mobile = breakpoint === 'xs' || breakpoint === 'sm';
  // Search collapses to an icon only when the song list shows 1 card per row (< 640px)
  const collapseSearch = breakpoint === 'xs';

  // Set synchronously by SearchBar (via useLayoutEffect) when it enters/exits xs-expanded mode,
  // so the random button and playlists are hidden in the same paint frame.
  const [searchExpanded, setSearchExpanded] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <SearchBar
        filters={filters}
        setFilters={setFilters}
        keyboardControl={keyboardControl}
        keyboardNavRegister={keyboardNavRegister}
        toolbarNavActive={toolbarNavActive}
        collapseSearch={collapseSearch}
        onExpandedChange={setSearchExpanded}
      />

      {/* Hidden when search is in xs-expanded mode — SearchBar fills the full width */}
      {!searchExpanded && (
        <>
          <Button
            size="small"
            type="button"
            aria-label="Random song"
            data-test="random-song-button"
            className="shrink-0 animate-none"
            {...keyboardNavRegister?.('random-song-button', onRandom, 'Random song')}
            onClick={onRandom}>
            <Casino className="h-5! w-5!" />
            <span className="mobile:hidden">Random</span>
          </Button>

          <div className="h-6 w-px shrink-0 bg-white/20" aria-hidden="true" />

          <PlaylistSelector
            playlists={playlists}
            selectedPlaylist={selectedPlaylist}
            setSelectedPlaylist={setSelectedPlaylist}
            mobile={mobile}
            keyboardNavRegister={keyboardNavRegister}
            onPlaylistSelected={onPlaylistSelected}
          />
        </>
      )}
    </div>
  );
}
