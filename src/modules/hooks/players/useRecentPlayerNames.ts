import { PLAYER_NAMES_SESSION_STORAGE_KEY } from 'modules/hooks/players/consts';
import storage from 'modules/utils/storage';
import { useMemo } from 'react';

export default function useRecentPlayerNames() {
  return useMemo<string[]>(() => JSON.parse(storage.session.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) ?? [], []);
}
