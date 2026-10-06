import { Dispatch, ReactNode, SetStateAction, useState } from 'react';

import { Button } from '~/modules/elements/akui/button';
import { Icon } from '~/modules/elements/akui/icon';
import useBreakpoint, { usePhoneOrientation } from '~/modules/hooks/use-breakpoint';
import { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { useSetlist } from '~/modules/songs/hooks/use-setlist';
import ExcludeLanguagesView from '~/routes/exclude-languages/exclude-languages-view';
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
  /** The second row's song groups navigation; under md search and random move next to it */
  groupsNavigation: ReactNode;
  groupsNavRegister?: RegisterFunc;
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
  groupsNavigation,
  groupsNavRegister,
}: ToolbarProps) {
  const breakpoint = useBreakpoint();
  // Under md (768px) search and random move to the row below, and the controls take the song groups' size
  const compact = breakpoint === 'xs' || breakpoint === 'sm';
  const size = compact ? 'mini' : 'small';
  // A phone held upright picks the playlist from a sheet rather than a row of tabs
  const playlistSheet = usePhoneOrientation() === 'portrait';
  // Search collapses to an icon only when the song list shows 1 card per row (< 640px)
  const collapseSearch = breakpoint === 'xs';
  // Labelled only where the keyboard help shows (lg+), as the app toolbar's help button needs the room there
  const showRandomLabel = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
  const navigate = useSmoothNavigate();
  const { isEditable } = useSetlist();
  const [languagesOpen, setLanguagesOpen] = useState(false);

  // Set synchronously by SearchBar (via useLayoutEffect) when it enters/exits xs-expanded mode,
  // so the random button and song groups are hidden in the same paint frame.
  const [searchExpanded, setSearchExpanded] = useState(false);

  const searchAndRandom = (
    <>
      <SearchBar
        filters={filters}
        setFilters={setFilters}
        keyboardControl={keyboardControl}
        keyboardNavRegister={compact ? groupsNavRegister : keyboardNavRegister}
        toolbarNavActive={toolbarNavActive}
        collapseSearch={collapseSearch}
        size={size}
        onExpandedChange={setSearchExpanded}
      />

      {/* Hidden when search is in xs-expanded mode — SearchBar fills the full width */}
      {!searchExpanded && (
        <>
          <Button
            size={size}
            type="button"
            aria-label="Random song"
            data-test="random-song-button"
            className="shrink-0 animate-none"
            {...(compact ? groupsNavRegister : keyboardNavRegister)?.('random-song-button', onRandom, 'Random song')}
            leftIcon={<Icon icon="ic:baseline-casino" />}
            fullWidth={false}
            onClick={onRandom}>
            {showRandomLabel ? 'Random' : undefined}
          </Button>

          <div className="h-6 w-px shrink-0 bg-white/20" aria-hidden="true" />
        </>
      )}
    </>
  );

  return (
    <>
      <div className="mr-28 flex items-center gap-2 max-md:mr-23 min-[1760px]:mr-0 lg:max-[1760px]:mr-41">
        {!compact && searchAndRandom}

        <PlaylistSelector
          playlists={playlists}
          selectedPlaylist={selectedPlaylist}
          setSelectedPlaylist={setSelectedPlaylist}
          mobile={playlistSheet}
          size={size}
          keyboardNavRegister={keyboardNavRegister}
          onPlaylistSelected={onPlaylistSelected}
        />

        <Button
          size={size}
          type="button"
          aria-label="Song settings"
          data-test="song-settings-button"
          className="shrink-0 animate-none"
          {...keyboardNavRegister?.('song-settings-button', () => setLanguagesOpen(true), 'Song settings')}
          leftIcon={<Icon icon="ic:baseline-settings" />}
          fullWidth={false}
          onClick={() => setLanguagesOpen(true)}
        />
      </div>
      <div className="flex items-center gap-2">
        {compact && searchAndRandom}
        {!searchExpanded && <div className="min-w-0 flex-1">{groupsNavigation}</div>}
      </div>
      {languagesOpen && (
        <ExcludeLanguagesView
          variant="modal"
          closeText="Continue to Song Selection"
          onClose={() => setLanguagesOpen(false)}
          inSongSelection
          onEditSongs={isEditable ? () => navigate('edit/list/') : undefined}
        />
      )}
    </>
  );
}
