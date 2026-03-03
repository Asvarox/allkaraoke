import { Casino, Search } from '@mui/icons-material';
import isMobile from 'is-mobile';
import { ComponentRef, Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '~/modules/Elements/AKUI/Button';
import { Input } from '~/modules/Elements/Input';
import events from '~/modules/GameEvents/GameEvents';
import { useEventEffect } from '~/modules/GameEvents/hooks';
import { REGULAR_ALPHA_CHARS } from '~/modules/hooks/useKeyboard';
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
}

const mobile = isMobile();

export default function Toolbar({
  filters,
  setFilters,
  onRandom,
  playlists,
  selectedPlaylist,
  setSelectedPlaylist,
  keyboardControl,
}: ToolbarProps) {
  const searchInput = useRef<ComponentRef<typeof Input>>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);

  const setSearch = (value: string) => {
    setFilters((current) => ({ ...current, search: value }));
  };

  const onLeave = () => {
    searchInput.current?.element?.blur();
  };

  useHotkeys('down', onLeave, { enabled: isFocused, enableOnTags: ['INPUT'] });

  const onSearchSong = (e: KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSearch(e.key);
  };

  useHotkeys(
    REGULAR_ALPHA_CHARS,
    (e) => {
      onSearchSong(e);
      setMobileSearchVisible(true);
    },
    { enabled: !filters.search && keyboardControl && mobile },
  );

  const onRemoteSearch = useCallback(
    (search: string) => {
      if (keyboardControl) setSearch(search);
    },
    [keyboardControl],
  );
  useEventEffect(events.remoteSongSearch, onRemoteSearch);

  useHotkeys(
    REGULAR_ALPHA_CHARS,
    (e) => {
      onSearchSong(e);
      searchInput.current?.element?.focus();
    },
    { enabled: !isFocused && keyboardControl },
    [filters.search],
  );

  useHotkeys(
    'Backspace',
    () => {
      searchInput.current?.element?.focus();
    },
    { enabled: !isFocused && keyboardControl },
    [filters.search],
  );

  useEffect(() => {
    if (!isFocused) setMobileSearchVisible(!!filters.search);
  }, [isFocused, filters.search]);

  return (
    <>
      <div className="fixed top-0 right-0 left-0 z-100 flex h-16 items-center gap-4 bg-black/80 px-4">
        {/* Search — desktop always visible, mobile shows icon button */}
        {mobile ? (
          <button
            type="button"
            aria-label="Search songs"
            className="flex h-10 w-10 items-center justify-center rounded text-white hover:bg-white/10"
            onClick={() => setMobileSearchVisible((v) => !v)}>
            <Search />
          </button>
        ) : (
          <div className="max-w-sm flex-1">
            <Input
              ref={searchInput}
              focused={false}
              label="Search"
              value={filters.search ?? ''}
              onChange={(val) => setSearch(val)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search songs…"
              data-test="search-input"
            />
          </div>
        )}

        {/* Random button */}
        <Button type="button" onClick={onRandom} aria-label="Random song" data-test="random-song-button">
          <Casino />
        </Button>

        {/* Playlist controls */}
        {mobile ? (
          <div className="ml-auto">
            <select
              className="rounded border border-white/20 bg-black/60 px-2 py-1 text-white"
              value={selectedPlaylist ?? ''}
              onChange={(e) => setSelectedPlaylist(e.target.value)}
              aria-label="Select playlist">
              {playlists.map((playlist) => (
                <option key={playlist.name} value={playlist.name}>
                  {playlist.display ?? playlist.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {playlists.map((playlist) => {
              const isActive = selectedPlaylist === playlist.name;
              return (
                <button
                  key={playlist.name}
                  type="button"
                  onClick={() => setSelectedPlaylist(playlist.name)}
                  className={`rounded px-3 py-1 text-white transition-colors hover:bg-white/20 ${isActive ? 'bg-white/20 ring-2 ring-white' : 'bg-transparent'}`}
                  data-test={`playlist-${playlist.name}`}
                  aria-pressed={isActive}>
                  {playlist.display ?? playlist.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile search overlay */}
      {mobile && mobileSearchVisible && (
        <div className="fixed top-16 right-0 left-0 z-200 bg-black/90 p-4">
          <Input
            ref={searchInput}
            focused={false}
            label="Search"
            value={filters.search ?? ''}
            onChange={(val) => setSearch(val)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !filters.search) {
                setMobileSearchVisible(false);
              }
            }}
            placeholder="Search songs…"
            autoFocus
            data-test="search-input-mobile"
          />
        </div>
      )}
    </>
  );
}
