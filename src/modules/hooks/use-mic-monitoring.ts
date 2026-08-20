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
export default function useMicMonitoring(reassertOn?: unknown) {
  useEffect(() => {
    const wasMonitoring = InputManager.monitoringStarted();
    const startPromise = InputManager.startMonitoring();
    return () => {
      if (!wasMonitoring) {
        // startMonitoring() only flips the "monitoring" flag once its own async work settles. If we
        // called stopMonitoring() immediately, a startMonitoring() that finishes later would win the
        // race and leave monitoring running after this component is gone. Wait for it to settle first.
        void startPromise.finally(() => {
          void InputManager.stopMonitoring();
        });
      }
    };
  }, []);

  useEffect(() => {
    if (reassertOn === undefined) return;
    void InputManager.startMonitoring();
  }, [reassertOn]);
}
