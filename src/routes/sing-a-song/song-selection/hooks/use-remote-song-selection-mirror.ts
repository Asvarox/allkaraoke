import { useEffect, useMemo } from 'react';

import { RemoteSongSelectionState } from '~/modules/remote-mic/network/client/subscriptions';
import RemoteMicServer from '~/modules/remote-mic/network/server';
import { LANGUAGE_PLAYLIST_PREFIX, PlaylistEntry } from '~/routes/sing-a-song/song-selection/hooks/use-playlists';
import { SongGroup } from '~/routes/sing-a-song/song-selection/hooks/use-song-list';
import { getSongIdWithNew } from '~/routes/sing-a-song/song-selection/utils/get-song-id-with-new';

interface Options {
  playlists: PlaylistEntry[];
  selectedPlaylist: string | null;
  groupedSongList: SongGroup[];
  /** Indexes of the groups scrolled into view — see `useVisibleSongGroups`. */
  visibleGroups: number[];
  focusedSong: string;
}

/**
 * A playlist the phone can activate on its own. The "More languages" placeholder can't: picking it
 * on screen opens a language picker sheet rather than switching playlist, and its empty filters are
 * never meant to be applied. The language the user already picked (`language-*`) is a real playlist
 * and stays — even though it shares the `isLanguagePicker` flag.
 */
const isRemoteSelectable = (playlist: PlaylistEntry) =>
  !playlist.isLanguagePicker || playlist.name.startsWith(LANGUAGE_PLAYLIST_PREFIX);

/**
 * Mirrors the song selection screen's playlist picker and group nav row to connected remote mics
 * (channel `song-selection`), so the phone can render the same controls the screen shows in its
 * mobile layout — including which group is currently in view and which holds the selected song.
 *
 * Kept apart from the `keyboard-layout` channel on purpose: this state changes on every scroll,
 * and folding it into the help entry would republish the whole keyboard layout with it.
 */
export default function useRemoteSongSelectionMirror({
  playlists,
  selectedPlaylist,
  groupedSongList,
  visibleGroups,
  focusedSong,
}: Options) {
  const state = useMemo<RemoteSongSelectionState>(() => {
    const focusedGroupIndex = groupedSongList.findIndex((group) =>
      group.songs.some((song) => getSongIdWithNew(song, group) === focusedSong),
    );

    return {
      playlists: playlists.filter(isRemoteSelectable).map((playlist) => ({
        name: playlist.name,
        label: playlist.remoteLabel ?? playlist.name,
      })),
      selectedPlaylist,
      groups: groupedSongList.map((group, index) => ({
        name: group.name,
        label: group.remoteLabel ?? group.name,
        visible: visibleGroups.includes(index),
        containsSelectedSong: index === focusedGroupIndex,
      })),
    };
  }, [playlists, selectedPlaylist, groupedSongList, visibleGroups, focusedSong]);

  useEffect(() => {
    RemoteMicServer.publish('song-selection', state);
  }, [state]);

  // Clear the channel on unmount so a phone that stays connected while the game leaves song
  // selection doesn't keep showing a playlist/group row for a screen that's gone.
  useEffect(() => () => RemoteMicServer.publish('song-selection', undefined), []);
}
