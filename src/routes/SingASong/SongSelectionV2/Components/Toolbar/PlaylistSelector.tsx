import { ExpandMore } from '@mui/icons-material';
import { useState } from 'react';
import { Button } from '~/modules/Elements/AKUI/Button';
import { Selector } from '~/modules/Elements/AKUI/Selector';
import { RegisterFunc } from '~/modules/hooks/useKeyboardNav';
import LanguagePickerBottomSheet from '~/routes/SingASong/SongSelectionV2/Components/LanguagePickerBottomSheet';
import PlaylistBottomSheet from '~/routes/SingASong/SongSelectionV2/Components/PlaylistBottomSheet';
import { LANGUAGE_PLAYLIST_PREFIX, PlaylistEntry } from '~/routes/SingASong/SongSelectionV2/Hooks/usePlaylists';

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
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  // Derive the currently selected language from the active playlist name (e.g. 'language-Polish' → 'Polish')
  const selectedLanguage = selectedPlaylist?.startsWith(LANGUAGE_PLAYLIST_PREFIX)
    ? selectedPlaylist.slice(LANGUAGE_PLAYLIST_PREFIX.length)
    : null;

  const handlePlaylistSelect = (name: string) => {
    const playlist = playlists.find((p) => p.name === name);
    if (playlist?.isLanguagePicker) {
      // Open the language picker sheet instead of activating the playlist directly
      setLanguagePickerOpen(true);
      return;
    }
    setSelectedPlaylist(name);
    onPlaylistSelected?.();
  };

  const handleLanguageSelected = (language: string) => {
    setSelectedPlaylist(`${LANGUAGE_PLAYLIST_PREFIX}${language}`);
    onPlaylistSelected?.();
  };

  if (mobile) {
    return (
      <>
        <Button
          size={{ xs: 'mini', sm: 'small' }}
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
            handlePlaylistSelect(name);
            setPlaylistSheetOpen(false);
          }}
          open={playlistSheetOpen}
          onClose={() => setPlaylistSheetOpen(false)}
        />
        <LanguagePickerBottomSheet
          open={languagePickerOpen}
          onClose={() => setLanguagePickerOpen(false)}
          onSelect={handleLanguageSelected}
          selectedLanguage={selectedLanguage}
        />
      </>
    );
  }

  return (
    <>
      <Selector value={selectedPlaylist ?? ''} onChange={handlePlaylistSelect} className="ml-auto flex-1">
        {playlists.map((playlist) => {
          const playlistNavProps = keyboardNavRegister?.(
            `playlist-${playlist.name}`,
            () => {
              handlePlaylistSelect(playlist.name);
            },
            String(playlist.name),
          );
          return (
            <Selector.Item
              key={playlist.name}
              value={playlist.name}
              size="small"
              className="shrink-0 animate-none px-3"
              data-test={`playlist-${playlist.name}`}
              {...playlistNavProps}>
              {playlist.display ?? playlist.name}
            </Selector.Item>
          );
        })}
      </Selector>
      <LanguagePickerBottomSheet
        open={languagePickerOpen}
        onClose={() => setLanguagePickerOpen(false)}
        onSelect={handleLanguageSelected}
        selectedLanguage={selectedLanguage}
      />
    </>
  );
}
