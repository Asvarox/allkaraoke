import { useEffect } from 'react';

import InputManager from '~/modules/game-engine/input/input-manager';

/**
 * Holds the audio pipeline open for as long as the component is mounted, so volume indicators have
 * data. Nothing here needs to know who else wants it: `InputManager.requestMonitoring()` counts the
 * holds and only tears the pipeline down once the last one is released.
 *
 * `reassertOn` is for screens that stay mounted across changes that can leave the pipeline behind —
 * an online room lives through every phase, and a singer who picks their mic after monitoring
 * started (joining via an invite link runs the setup wizard inside the room) would otherwise be
 * monitored with the input they had at mount. Changing it brings the pipeline up to date with the
 * inputs as they now are.
 */
export default function useMicMonitoring(reassertOn?: unknown) {
  useEffect(() => InputManager.startMonitoring(), []);

  useEffect(() => {
    if (reassertOn === undefined) return;
    void InputManager.reassertMonitoring();
  }, [reassertOn]);
}
