import { useMemo } from 'react';
import { PLAYER_NAMES_SESSION_STORAGE_KEY } from '~/modules/hooks/players/consts';
import storage from '~/modules/utils/storage';

export default function useRecentPlayerNames() {
  return useMemo<string[]>(() => JSON.parse(storage.session.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) ?? [], []);
}
