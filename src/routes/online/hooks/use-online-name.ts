import { useCallback, useState } from 'react';

import { MAX_NAME_LENGTH } from '~/consts';
import { ONLINE_NAME_KEY } from '~/modules/online/client/online-client';
import storage from '~/modules/utils/storage';

/** Local storage (not session) so the name survives closing the tab — one less step on every visit. */
export const getStoredOnlineName = () =>
  (storage.local.getItem<string>(ONLINE_NAME_KEY) ?? '').trim().slice(0, MAX_NAME_LENGTH);

export const setStoredOnlineName = (name: string) =>
  storage.local.setItem(ONLINE_NAME_KEY, name.trim().slice(0, MAX_NAME_LENGTH));

/**
 * The remembered display name for online rooms. `hasStoredName` lets the setup wizard skip the name
 * step entirely for a returning singer — same behaviour as the remote mic's `useRemoteMicName`.
 */
export default function useOnlineName() {
  const [name, setName] = useState(getStoredOnlineName);

  const persistName = useCallback((next: string) => {
    const trimmed = next.trim().slice(0, MAX_NAME_LENGTH);
    setStoredOnlineName(trimmed);
    setName(trimmed);
  }, []);

  return { name, hasStoredName: name !== '', setName: persistName };
}
