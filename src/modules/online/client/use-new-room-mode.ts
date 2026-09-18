import { OnlineRoomMode } from '~/modules/online/client/room-mode';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import isE2E from '~/modules/utils/is-e2-e';
import useFeatureFlag from '~/modules/utils/use-feature-flag';

/**
 * The mode a room this browser *opens* should run in — and nothing else.
 *
 * This is the only place the `OnlineP2P` flag is read. Joining a room never consults it: the room's
 * mode is written into its code (`roomModeOf`), so a singer whose flag disagrees with the host's
 * still lands in the host's room, and switching the flag off changes what the next room is opened
 * with rather than stranding anyone already in one.
 *
 * Read at the moment the room is opened, not when the page mounts: PostHog answers `undefined`
 * until it has loaded flags, which on somebody's very first visit is a network round trip away,
 * and a code generated before then would lock an enrolled singer into the old mode for the whole
 * room. Undecided still means server — the mode that is live everywhere today.
 *
 * `useFeatureFlag` forces every flag on under dev and e2e, which would leave server mode with no
 * browser coverage at all. So under e2e an opt-in set from the test decides instead (see
 * `useServerOnlineMode` in tests/helpers.ts), defaulting to P2P as the newer of the two.
 */
export const useNewRoomMode = (): OnlineRoomMode => {
  const flagEnabled = useFeatureFlag(FeatureFlags.OnlineP2P);

  if (isE2E()) return globalThis.isE2EOnlineServerMode ? 'server' : 'p2p';

  return flagEnabled ? 'p2p' : 'server';
};
