import { useEffect, useRef, useState } from 'react';

import { ONLINE_SEEK_SETTLE_MS } from '~/modules/online/protocol/consts';
import { OnlinePlaybackStatus } from '~/modules/online/protocol/types';

/** Seeking a YouTube video makes it buffer. Tracks the client's own seeks so that buffering isn't
 * blamed on the network: it is only reported to the room once it outlasts ONLINE_SEEK_SETTLE_MS. */
export function useSeekSettle(report: (status: OnlinePlaybackStatus) => void, isStillBuffering: () => boolean) {
  const callbacks = useRef({ report, isStillBuffering });
  useEffect(() => {
    callbacks.current = { report, isStillBuffering };
  });

  // Created once: the playback effects depend on it, and a new identity would restart them
  const [seekSettle] = useState(() => {
    let lastSeekAt = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    const isSettling = () => Date.now() - lastSeekAt < ONLINE_SEEK_SETTLE_MS;

    return {
      markSeek: () => {
        lastSeekAt = Date.now();
      },
      isSettling,
      reportStatus: (status: OnlinePlaybackStatus) => {
        clearTimeout(settleTimer);
        if (status === 'buffering' && isSettling()) {
          // Report it only if it outlasts the settle window, i.e. it's a genuine stall
          settleTimer = setTimeout(
            () => {
              if (callbacks.current.isStillBuffering()) callbacks.current.report('buffering');
            },
            ONLINE_SEEK_SETTLE_MS - (Date.now() - lastSeekAt),
          );
        } else {
          callbacks.current.report(status);
        }
      },
      dispose: () => clearTimeout(settleTimer),
    };
  });
  useEffect(() => seekSettle.dispose, [seekSettle]);

  return seekSettle;
}
