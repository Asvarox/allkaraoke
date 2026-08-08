import { AnimatePresence, motion } from 'motion/react';
import { ComponentRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePrevious, useUnmount } from 'react-use';

import { MAX_NAME_LENGTH } from '~/consts';
import { Button } from '~/modules/elements/akui/button';
import { Icon } from '~/modules/elements/akui/icon';
import { Input } from '~/modules/elements/input';
import useDebounce from '~/modules/hooks/use-debounce';
import { serverRpc } from '~/modules/remote-mic/network/client';

interface Props {
  onSearchStateChange?: (isActive: boolean) => void;
  /**
   * Fired when the field expands/collapses so the toolbar can hide the random button and the
   * playlist picker — the same trade the song selection screen makes in its xs layout.
   */
  onExpandedChange?: (expanded: boolean) => void;
}

/**
 * Mirrors the song selection screen's xs search control: a lone icon button that expands into a
 * full-width input. Closing it clears the search on the host too (same as the screen's own close
 * button), so the phone never leaves the TV filtered by a search box nobody can see.
 */
function RemoteSongSearch({ onSearchStateChange, onExpandedChange }: Props) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<ComponentRef<typeof Input>>(null);

  const debouncedSearch = useDebounce(search, 100);

  const previousSearch = usePrevious(debouncedSearch);
  useEffect(() => {
    if (previousSearch !== debouncedSearch) {
      void serverRpc.songs.search(debouncedSearch.trim());
    }
  }, [previousSearch, debouncedSearch]);

  // useLayoutEffect so the toolbar drops the sibling controls in the same paint frame the input
  // expands, rather than showing both for a frame.
  useLayoutEffect(() => {
    onExpandedChange?.(expanded);
    // Tied to `expanded` rather than input focus: the panel should keep the room it made for the
    // keyboard while the field is open, even between taps.
    onSearchStateChange?.(expanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass fresh callbacks each render; keyed on the expansion transition only
  }, [expanded]);

  useUnmount(() => {
    onSearchStateChange?.(false);
    onExpandedChange?.(false);
  });

  const closeSearch = () => {
    setSearch('');
    setExpanded(false);
  };

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
            ref={inputRef}
            size="small"
            focused={false}
            maxLength={MAX_NAME_LENGTH}
            label={<Icon icon="ic:baseline-search" size={5} />}
            placeholder="Search for a song…"
            value={search}
            onChange={setSearch}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || (e.key === 'Backspace' && !search)) closeSearch();
            }}
            autoFocus
            className="w-full"
            adornment={
              <button
                type="button"
                aria-label="Close search"
                className="flex"
                onMouseDown={(e) => {
                  e.preventDefault();
                  closeSearch();
                }}
                data-test="close-search-song-button">
                <Icon icon="ic:baseline-close" size={5} className="text-white" />
              </button>
            }
            data-test="search-song-input"
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
            size="small"
            type="button"
            aria-label="Search songs"
            className="shrink-0 animate-none"
            leftIcon={<Icon icon="ic:baseline-search" size={5} />}
            onClick={() => setExpanded(true)}
            data-test="search-song-button"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RemoteSongSearch;
