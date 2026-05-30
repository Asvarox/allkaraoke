import { Close, Search } from '@mui/icons-material';
import { AnimatePresence, motion } from 'motion/react';
import { ComponentRef, useRef, useState } from 'react';
import { Badge } from '~/modules/elements/akui/badge';
import { Button } from '~/modules/elements/akui/button';
import { Selector } from '~/modules/elements/akui/selector';
import { Input } from '~/modules/elements/input';
import LanguageFilter from '~/routes/remote-mic/panels/remote-song-list/language-filter';

type LanguageList = { name: string; count: number }[];

interface SongListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  tab: 'list' | 'queue';
  onTabChange: (tab: 'list' | 'queue') => void;
  savedSongCount: number;
  excludedLanguages: string[];
  onExcludedLanguagesChange: (languages: string[]) => void;
  languages: LanguageList;
}

export default function SongListToolbar({
  search,
  onSearchChange,
  tab,
  onTabChange,
  savedSongCount,
  excludedLanguages,
  onExcludedLanguagesChange,
  languages,
}: SongListToolbarProps) {
  const [searchExpanded, setSearchExpanded] = useState(search !== '');
  const searchInputRef = useRef<ComponentRef<typeof Input>>(null);
  const selectedLanguages = languages.length - excludedLanguages.length;

  const closeSearch = () => {
    onSearchChange('');
    setSearchExpanded(false);
  };

  return (
    <div className="typography bg-black/75 p-1.5 px-3">
      <AnimatePresence mode="wait" initial={false}>
        {searchExpanded ? (
          <motion.div
            key="search-expanded"
            className="w-full"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}>
            <Input
              ref={searchInputRef}
              size="mini"
              className="w-full text-sm"
              focused={false}
              label={<Search className="h-4! w-4!" />}
              placeholder="Search the list…"
              value={search}
              onChange={onSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !search) closeSearch();
                if (e.key === 'Escape') closeSearch();
              }}
              adornment={
                <button
                  type="button"
                  aria-label="Close search"
                  onMouseDown={(e) => {
                    // Prevent input blur before the click fires
                    e.preventDefault();
                    closeSearch();
                  }}
                  data-test="search-close-button">
                  <Close className="h-4! w-4! text-white" />
                </button>
              }
              autoFocus
              data-test="search-input"
            />
          </motion.div>
        ) : (
          <motion.div
            key="search-collapsed"
            className="flex gap-1"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}>
            <Button
              size="mini"
              onClick={() => setSearchExpanded(true)}
              className="aspect-square scale-100 animate-none px-0!"
              data-test="search-button"
              aria-label="Search songs">
              <Search className="h-4! w-4!" />
            </Button>
            <Selector value={tab} onChange={(value) => onTabChange(value as 'list' | 'queue')} className="flex-1">
              <Selector.Item value="list" size="mini" className="flex-1 text-sm" data-test="all-songs-button">
                All songs
              </Selector.Item>
              <Selector.Item value="queue" size="mini" className="flex-1 text-sm" data-test="your-list-button">
                Your list ({savedSongCount})
              </Selector.Item>
            </Selector>
            <LanguageFilter
              excludedLanguages={excludedLanguages}
              languageList={languages}
              onListChange={onExcludedLanguagesChange}>
              {({ open }) => (
                <Button
                  size="mini"
                  onClick={open}
                  focused={excludedLanguages.length > 0 && tab === 'list'}
                  className="scale-100 animate-none"
                  data-test="song-language-filter">
                  🇺🇳{selectedLanguages < languages.length && <Badge>{selectedLanguages}</Badge>}
                </Button>
              )}
            </LanguageFilter>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
