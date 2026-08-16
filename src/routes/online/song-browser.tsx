import { throttle } from 'es-toolkit';
import { useEffect, useMemo, useRef } from 'react';

import { SongPreview } from '~/interfaces';
import OnlineClient from '~/modules/online/client/online-client';
import { toSongHoverPreview } from '~/modules/online/client/song-preview';
import { OnlineSongSelectionContext, OnlineSongSelectionIntegration } from '~/modules/online/song-selection-context';
import OnlineSongPlayersPanel from '~/routes/online/lobby/song-players-panel';
import SingASong from '~/routes/sing-a-song/sing-a-song';

interface Props {
  /** The room's current pick, so re-opening the browser lands back on it. */
  preselectedSong: string | null;
  onSongSelected: (song: SongPreview, tolerance: number, difficulty?: string) => void;
}

/** The host's song browser as a screen of its own: the shared song list, wired to publish whatever
 * the host is looking at so the rest of the room can follow along and vote on it. Host-only — the
 * route renders the lobby for everyone else. */
function OnlineSongBrowser({ preselectedSong, onSongSelected }: Props) {
  // Share what the host hovers in the song browser (plus difficulty/mode) with the room
  const previewDraft = useRef<{ song?: SongPreview; difficulty?: string }>({});
  const publisher = useMemo(() => {
    const send = throttle(() => {
      const { song, difficulty } = previewDraft.current;
      OnlineClient.send.selection.setPreview(song ? toSongHoverPreview(song, difficulty) : null);
    }, 300);
    return {
      onSongFocused: (song: SongPreview | undefined) => {
        // A difficulty picked for the previously focused song doesn't carry over to a different one
        const sameSong = previewDraft.current.song?.id === song?.id;
        previewDraft.current = { song, difficulty: sameSong ? previewDraft.current.difficulty : undefined };
        send();
      },
      onSettingsChange: (song: SongPreview, difficulty: string) => {
        previewDraft.current = { song, difficulty };
        send();
      },
      cancel: send.cancel,
    };
  }, []);

  useEffect(
    () => () => {
      // Left the browser — clear the shared hover (the server falls back to the selected song)
      publisher.cancel();
      OnlineClient.send.selection.setPreview(null);
    },
    [publisher],
  );

  const integration = useMemo<OnlineSongSelectionIntegration>(
    () => ({
      onPreviewSettingsChange: publisher.onSettingsChange,
      playersView: <OnlineSongPlayersPanel />,
    }),
    [publisher],
  );

  return (
    <OnlineSongSelectionContext.Provider value={integration}>
      <SingASong
        onSongSelected={(setup) => onSongSelected(setup.song, setup.tolerance, previewDraft.current.difficulty)}
        onSongFocused={publisher.onSongFocused}
        preselectedSong={preselectedSong}
      />
    </OnlineSongSelectionContext.Provider>
  );
}

export default OnlineSongBrowser;
