import { Close, Search } from '@mui/icons-material';
import { AnimatePresence, motion } from 'motion/react';
import {
  ComponentRef,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Button } from '~/modules/elements/akui/button';
import { Input } from '~/modules/elements/input';
import events from '~/modules/game-events/game-events';
import { useEventEffect } from '~/modules/game-events/hooks';
import { REGULAR_ALPHA_CHARS } from '~/modules/hooks/use-keyboard';
import { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import { AppliedFilters } from '~/routes/sing-a-song/song-selection/hooks/use-song-list-filter';

interface SearchBarProps {
  filters: AppliedFilters;
  setFilters: Dispatch<SetStateAction<AppliedFilters>>;
  keyboardControl: boolean;
  keyboardNavRegister?: RegisterFunc;
  /** True while keyboard nav is active inside the toolbar — suppresses hotkeys that would interfere. */
  toolbarNavActive?: boolean;
  /** True when screen is xs (<640px) and search collapses to an icon */
  collapseSearch: boolean;
  /** Called synchronously (via useLayoutEffect) when xs-expanded state changes, so Toolbar
   *  can show/hide the random button and playlists in the same paint frame. */
  onExpandedChange?: (expanded: boolean) => void;
}

export default function SearchBar({
  filters,
  setFilters,
  keyboardControl,
  keyboardNavRegister,
  toolbarNavActive = false,
  collapseSearch,
  onExpandedChange,
}: SearchBarProps) {
  const searchInput = useRef<ComponentRef<typeof Input>>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);

  const setSearch = (value: string) => {
    setFilters((current) => ({ ...current, search: value }));
  };

  const closeSearch = () => {
    setSearch('');
    setMobileSearchVisible(false);
  };

  // When filter is cleared externally (e.g. playlist switch), sync the xs visible state
  useEffect(() => {
    if (!isFocused && collapseSearch) setMobileSearchVisible(!!filters.search);
  }, [isFocused, filters.search, collapseSearch]);

  const expanded = collapseSearch && mobileSearchVisible;

  // Effect Event: notify the parent with the latest callback without making it a dependency, so the
  // layout effect fires only when `expanded` changes, not whenever a fresh `onExpandedChange` arrives.
  const notifyExpandedChange = useEffectEvent((value: boolean) => {
    onExpandedChange?.(value);
  });

  // useLayoutEffect so Toolbar hides random+playlists in the same paint frame SearchBar expands,
  // preventing a layout shift where both the expanding input and other buttons are briefly visible.
  useLayoutEffect(() => {
    notifyExpandedChange(expanded);
  }, [expanded]);

  useHotkeys('down', () => searchInput.current?.element?.blur(), { enabled: isFocused, enableOnTags: ['INPUT'] });

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
    { enabled: !filters.search && keyboardControl && collapseSearch },
  );

  const onRemoteSearch = useCallback(
    (search: string) => {
      if (keyboardControl) setFilters((current) => ({ ...current, search }));
    },
    [keyboardControl, setFilters],
  );
  useEventEffect(events.remoteSongSearch, onRemoteSearch);

  useHotkeys(
    REGULAR_ALPHA_CHARS,
    (e) => {
      onSearchSong(e);
      searchInput.current?.element?.focus();
    },
    // Disabled during toolbar nav mode: the user is navigating between toolbar elements,
    // not trying to type into search.
    { enabled: !isFocused && keyboardControl && !toolbarNavActive },
    [filters.search, toolbarNavActive],
  );

  // xs: animate between the collapsed icon and the full-width expanded input
  if (collapseSearch) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        {expanded ? (
          <motion.div
            key="search-expanded"
            className="w-full"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}>
            <Input
              ref={searchInput}
              size={{ xs: 'mini', sm: 'small' }}
              focused={false}
              label={<Search className="h-5! w-5!" />}
              value={filters.search ?? ''}
              onChange={(val) => setSearch(val)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !filters.search) closeSearch();
                if (e.key === 'Escape') closeSearch();
              }}
              placeholder="Search songs…"
              autoFocus
              className="w-full"
              adornment={
                <button
                  type="button"
                  aria-label="Close search"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    closeSearch();
                  }}>
                  <Close className="h-5! w-5! text-white" />
                </button>
              }
              data-test="search-input"
            />
          </motion.div>
        ) : (
          <motion.div
            key="search-icon"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}>
            <Button
              size={{ xs: 'mini', sm: 'small' }}
              type="button"
              aria-label="Search songs"
              className="shrink-0 animate-none"
              {...keyboardNavRegister?.('search', () => setMobileSearchVisible(true), 'Search')}>
              <Search className="h-5! w-5!" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // sm+: always-visible search input, no animation needed
  const searchNavProps = keyboardNavRegister?.('search', () => searchInput.current?.element?.focus(), 'Search');
  return (
    <div {...searchNavProps}>
      <Input
        ref={searchInput}
        focused={searchNavProps?.focused ?? false}
        label={<Search className="h-5! w-5!" />}
        value={filters.search ?? ''}
        onChange={(val) => setSearch(val)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          // Blur the input (return to toolbar arrow-key navigation) on Enter or
          // Backspace-when-empty, so the user can navigate to other toolbar elements.
          if (e.key === 'Enter' || (e.key === 'Backspace' && !filters.search)) {
            searchInput.current?.element?.blur();
          }
        }}
        placeholder="Search songs…"
        data-test="search-input"
      />
    </div>
  );
}
