import { useSyncExternalStore } from 'react';
import createPersistedState from 'use-persisted-state';

import { SongPreview } from '~/interfaces';
import useInstrumentalsEnabled from '~/modules/songs/use-instrumentals-enabled';

/** The vocals switch as the player set it, remembered across songs; null until they touch it */
const useExplicitInstrumentalPreference = createPersistedState<boolean | null>('song_settings-instrumental');

// What the selected playlist implies when the player hasn't chosen (e.g. "No vocals" turns vocals off)
let playlistDefault = false;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setPlaylistInstrumentalDefault = (value: boolean) => {
  if (value === playlistDefault) return;
  playlistDefault = value;
  listeners.forEach((listener) => listener());
};

/** Whether to play instrumentals: the player's own choice, else the selected playlist's default.
 * Online, the picker's choice is what the whole room plays */
export function useInstrumentalPreference() {
  const enabled = useInstrumentalsEnabled();
  const [explicit, setExplicit] = useExplicitInstrumentalPreference(null);
  const fromPlaylist = useSyncExternalStore(
    subscribe,
    () => playlistDefault,
    () => false,
  );

  return [enabled && (explicit ?? fromPlaylist), setExplicit] as const;
}

/** Whether the song should play its instrumental version, shared by the song settings and the preview video */
export default function usePlayInstrumental(songPreview: Pick<SongPreview, 'instrumental'>) {
  const enabled = useInstrumentalsEnabled();
  const [preferInstrumental, setPreferInstrumental] = useInstrumentalPreference();
  const isAvailable = enabled && !!songPreview.instrumental;
  const playInstrumental = isAvailable && preferInstrumental;

  return { isAvailable, playInstrumental, setPlayInstrumental: setPreferInstrumental };
}
