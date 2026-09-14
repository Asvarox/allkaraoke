import { OnlineRoomMode } from '~/modules/online/client/online-client';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import isE2E from '~/modules/utils/is-e2-e';
import useFeatureFlag from '~/modules/utils/use-feature-flag';

/**
 * Which online mode this browser should use.
 *
 * Server-authoritative by default; the `OnlineP2P` flag opts into running the room in the host's
 * browser over the SFU. Read in one place because everyone in a room has to agree — the joiner
 * checks the code against the mode it is about to connect with, and then connects with that same
 * mode.
 *
 * `useFeatureFlag` forces every flag on under dev and e2e, which would leave the fallback with no
 * browser coverage at all. So under e2e the mode is driven by an opt-in set from the test, letting
 * the suite run either side. It defaults to P2P, which is the newer of the two and the one that
 * needs the exercise.
 */
export const useOnlineMode = (): OnlineRoomMode => {
  const flagEnabled = useFeatureFlag(FeatureFlags.OnlineP2P);

  if (isE2E()) return globalThis.isE2EOnlineServerMode ? 'server' : 'p2p';

  return flagEnabled ? 'p2p' : 'server';
};
