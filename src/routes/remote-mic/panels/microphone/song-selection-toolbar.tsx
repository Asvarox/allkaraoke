import { useState } from 'react';

import { BottomSheet } from '~/modules/elements/akui/bottom-sheet';
import { Button } from '~/modules/elements/akui/button';
import { Icon } from '~/modules/elements/akui/icon';
import { serverRpc } from '~/modules/remote-mic/network/client';
import { RemotePlaylistEntry } from '~/modules/remote-mic/network/client/subscriptions';
import vibrate from '~/modules/utils/vibrate';
import RemoteSongSearch from '~/routes/remote-mic/panels/microphone/remote-song-search';

interface Props {
  playlists: RemotePlaylistEntry[];
  selectedPlaylist: string | null;
  /** False while the host screen doesn't accept remote search (see `HelpEntry.remote`). */
  searchEnabled: boolean;
  randomEnabled: boolean;
  onRandom: () => void;
  onSearchStateChange?: (isActive: boolean) => void;
}

/**
 * The song selection screen's toolbar, mirrored to the phone in the SAME shape the screen itself
 * takes at its smallest breakpoint — search collapsed to an icon, random as an icon between it and
 * the playlist picker, and playlists behind a bottom sheet. A phone is that breakpoint, so following
 * the mobile layout means there's one arrangement to learn rather than two.
 */
export default function SongSelectionToolbar({
  playlists,
  selectedPlaylist,
  searchEnabled,
  randomEnabled,
  onRandom,
  onSearchStateChange,
}: Props) {
  // Set synchronously by RemoteSongSearch when it expands, so the sibling controls disappear in the
  // same frame the input takes over the row.
  const [searchExpanded, setSearchExpanded] = useState(false);

  return (
    <div className="flex shrink-0 items-center gap-2">
      {searchEnabled && (
        <RemoteSongSearch onSearchStateChange={onSearchStateChange} onExpandedChange={setSearchExpanded} />
      )}

      {!searchExpanded && (
        <>
          <Button
            size="small"
            type="button"
            aria-label="Random song"
            disabled={!randomEnabled}
            className="shrink-0 animate-none"
            leftIcon={<Icon icon="ic:baseline-casino" size={5} />}
            onClick={onRandom}
            data-test="keyboard-shift-r"
          />

          <div className="h-6 w-px shrink-0 bg-white/20" aria-hidden="true" />

          <PlaylistPicker playlists={playlists} selectedPlaylist={selectedPlaylist} />
        </>
      )}
    </div>
  );
}

/**
 * The playlist picker, mirroring the screen's mobile control: a button showing the active playlist
 * that opens a bottom sheet. Selection is applied optimistically — the phone shows the new playlist
 * immediately and the host's own `song-selection` push confirms it a round trip later.
 */
function PlaylistPicker({ playlists, selectedPlaylist }: Pick<Props, 'playlists' | 'selectedPlaylist'>) {
  const [open, setOpen] = useState(false);
  const [optimisticPlaylist, setOptimisticPlaylist] = useState<string | null>(null);

  // Drop the optimistic value as soon as the host echoes any playlist back — whether it's the one
  // that was picked or (if the host refused it) the one that's actually active.
  const [previousSelected, setPreviousSelected] = useState(selectedPlaylist);
  if (previousSelected !== selectedPlaylist) {
    setPreviousSelected(selectedPlaylist);
    setOptimisticPlaylist(null);
  }

  const activePlaylist = optimisticPlaylist ?? selectedPlaylist;
  const activeLabel = playlists.find((playlist) => playlist.name === activePlaylist)?.label ?? activePlaylist ?? 'All';

  const select = (name: string) => {
    vibrate(100);
    setOptimisticPlaylist(name);
    setOpen(false);
    void serverRpc.songs.setPlaylist(name);
  };

  return (
    <>
      <Button
        size="small"
        type="button"
        disabled={playlists.length === 0}
        className="ml-auto min-w-0 flex-1 animate-none justify-between"
        onClick={() => setOpen(true)}
        data-test="playlist-picker-trigger">
        <span className="truncate">{activeLabel}</span>
        <Icon icon="ic:baseline-expand-more" size={5} />
      </Button>
      {/* Mounted only while open — see the note on TextControl's modal in remote-controls.tsx for
          why a permanently mounted, animated overlay is a hazard on a touch-only screen. */}
      {open && (
        <BottomSheet open onClose={() => setOpen(false)} title="Playlists">
          <div className="flex flex-col gap-1 pb-2">
            {playlists.map((playlist) => (
              <Button
                key={playlist.name}
                size="small"
                focused={playlist.name === activePlaylist}
                onClick={() => select(playlist.name)}
                className="w-full justify-start px-4"
                data-test={`playlist-sheet-${playlist.name}`}>
                {playlist.label}
              </Button>
            ))}
          </div>
        </BottomSheet>
      )}
    </>
  );
}
