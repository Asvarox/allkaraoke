import { PLAYER_NAMES_SESSION_STORAGE_KEY } from 'hooks/players/consts';
import { useMemo } from 'react';

export default function useRecentPlayerNames() {
    return useMemo<string[]>(() => JSON.parse(sessionStorage.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) ?? [], []);
}
