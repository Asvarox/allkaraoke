import { Casino } from '@mui/icons-material';
import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '~/modules/elements/akui/button';
import useBreakpoint from '~/modules/hooks/use-breakpoint';
import { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import PlaylistSelector from '~/routes/sing-a-song/song-selection/components/toolbar/playlist-selector';
import SearchBar from '~/routes/sing-a-song/song-selection/components/toolbar/search-bar';
import { PlaylistEntry } from '~/routes/sing-a-song/song-selection/hooks/use-playlists';
import { AppliedFilters } from '~/routes/sing-a-song/song-selection/hooks/use-song-list-filter';

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
    <div className="mr-20 flex items-center gap-2 min-[1600px]:mr-0 md:max-[1600px]:mr-30">
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
            size={{ xs: 'mini', sm: 'small' }}
            type="button"
            aria-label="Random song"
            data-test="random-song-button"
            className="shrink-0 animate-none"
            {...keyboardNavRegister?.('random-song-button', onRandom, 'Random song')}
            onClick={onRandom}>
            <Casino className="h-5! w-5!" />
            <span className="hidden lg:block">Random</span>
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
