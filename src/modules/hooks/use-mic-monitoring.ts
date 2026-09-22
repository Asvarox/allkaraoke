import { useEffect } from 'react';

import InputManager from '~/modules/game-engine/input/input-manager';

/**
 * Keeps the audio pipeline running for as long as the component is mounted, so volume indicators
 * have data. Monitoring that was already running before the mount is left alone on unmount —
 * these screens are nested (input setup inside the online wizard inside a room), and the innermost
 * one must not tear down a pipeline it didn't start.
 *
 * `reassertOn` is for screens that stay mounted across changes that can leave the pipeline behind —
 * an online room lives through every phase, and a singer who picks their mic after monitoring
 * started (joining via an invite link runs the setup wizard inside the room) would otherwise be
 * monitored with the input they had at mount. Changing it re-runs `startMonitoring()`, which is
 * idempotent per device: it picks up inputs added since, and never tears a running one down.
 */
/**
 * How many mounted components are currently holding the pipeline open. The flag on `InputManager`
 * can't answer that on its own: it only flips once `startMonitoring()`'s async work settles, so
 * between a mount and that moment a second holder reads it as "nobody is monitoring". Counting the
 * holders instead makes the answer immediate, which is what the deferred stop below needs.
 */
let holders = 0;

/**
 * Whether the pipeline belongs to the holders rather than to someone outside this hook (the game
 * engine, say), who is owed it for as long as they want it. Ownership is a property of the group,
 * not of whoever happens to unmount last: it is decided when the first holder arrives and holds
 * until the last one leaves.
 */
let startedByHolders = false;

export default function useMicMonitoring(reassertOn?: unknown) {
  useEffect(() => {
    if (holders === 0) {
      startedByHolders = !InputManager.monitoringStarted();
    }
    holders++;

    // A remote input rejects when its transport drops mid-connection. Nothing here can act on that
    // - monitoring simply isn't running - but the cleanup below still has to wait for the attempt
    // to settle, so absorb it at the source rather than leaving an unhandled rejection behind.
    const startPromise = InputManager.startMonitoring().catch(() => undefined);

    return () => {
      holders--;

      // startMonitoring() only flips the "monitoring" flag once its own async work settles. If we
      // called stopMonitoring() immediately, a startMonitoring() that finishes later would win the
      // race and leave monitoring running after this component is gone. Wait for it to settle first.
      void startPromise.finally(() => {
        // ...and by then someone else may be holding it open - either a nested screen, or this very
        // component re-mounting, which is what React's StrictMode does on every mount in dev. Tearing
        // the pipeline down there would leave the screen that just mounted without a mic for good.
        if (holders === 0 && startedByHolders) {
          void InputManager.stopMonitoring();
        }
      });
    };
  }, []);

  useEffect(() => {
    if (reassertOn === undefined) return;
    void InputManager.startMonitoring();
  }, [reassertOn]);
}
