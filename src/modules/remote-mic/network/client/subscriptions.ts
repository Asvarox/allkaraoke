import { backgroundTheme } from '~/modules/elements/layout-with-background';
import { ClientSubscriptionManager } from '~/modules/network/rpc/subscription-manager';
import { PlayerNumber } from '~/modules/players/player-number';
import { HelpEntry } from '~/routes/keyboard-help/context';

/**
 * A playlist as mirrored to the remote mic. The host's `display` is JSX (flags, logos, tooltips),
 * none of which crosses the wire — so a plain `label` is sent instead (`remoteLabel ?? name`).
 */
export interface RemotePlaylistEntry {
  name: string;
  label: string;
}

/**
 * A song group as mirrored to the remote mic, carrying the same two highlight states the on-screen
 * group nav row shows, so the phone can render them identically without recomputing anything.
 */
export interface RemoteSongGroupEntry {
  name: string;
  label: string;
  /** The group's header is currently scrolled into view in the song list — full highlight. */
  visible: boolean;
  /** The currently selected song lives in this group — subtle highlight, unless already `visible`. */
  containsSelectedSong: boolean;
}

/** Everything the phone needs to mirror the song selection screen's toolbar and group nav row. */
export interface RemoteSongSelectionState {
  playlists: RemotePlaylistEntry[];
  selectedPlaylist: string | null;
  groups: RemoteSongGroupEntry[];
}

/** Typed subscription channels and the data type pushed for each channel.
 * A type alias (not interface) so it satisfies the RPC core's AnySubscriptionChannels constraint. */
export type SubscriptionChannels = {
  'remote-mics': Array<{ id: string; name: string; number: PlayerNumber | null }>;
  'keyboard-layout': HelpEntry | undefined;
  // Published only while the song selection screen is mounted; `undefined` once it unmounts, so a
  // phone that reconnects onto another screen never renders a stale playlist/group row.
  'song-selection': RemoteSongSelectionState | undefined;
  style: backgroundTheme;
};

export type ChannelName = keyof SubscriptionChannels;
export type ChannelData<C extends ChannelName> = SubscriptionChannels[C];

/** Singleton used by remote-mic hooks and NetworkClient. */
export const subscriptionManager = new ClientSubscriptionManager<SubscriptionChannels>();
