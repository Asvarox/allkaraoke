import { useEffect } from 'react';

import InputManager from '~/modules/game-engine/input/input-manager';

/**
 * Keeps the audio pipeline running for as long as the component is mounted, so volume indicators
 * have data. Monitoring that was already running before the mount is left alone on unmount —
 * these screens are nested (input setup inside the online wizard inside a room), and the innermost
 * one must not tear down a pipeline it didn't start.
 */
export default function useMicMonitoring() {
  useEffect(() => {
    const wasMonitoring = InputManager.monitoringStarted();
    InputManager.startMonitoring();
    return () => {
      if (!wasMonitoring) {
        InputManager.stopMonitoring();
      }
    };
  }, []);
}
