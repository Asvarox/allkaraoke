import { createContext, ReactNode, useContext } from 'react';
import { SongPreview } from '~/interfaces';

/** Integration point the online lobby provides to the shared song-selection components.
 * Kept as a tiny context (no online imports) so the shared components stay lightweight
 * and local party mode is unaffected (context is null there). */
export interface OnlineSongSelectionIntegration {
  /** Reports the expanded song + chosen difficulty so the whole room can see them live. */
  onPreviewSettingsChange: (song: SongPreview, difficulty: string) => void;
  /** Rendered instead of the mic check — connected singers and their song votes. */
  playersView: ReactNode;
}

export const OnlineSongSelectionContext = createContext<OnlineSongSelectionIntegration | null>(null);

/** Non-null while the song browser runs inside an online room. */
export const useOnlineSongSelection = () => useContext(OnlineSongSelectionContext);
