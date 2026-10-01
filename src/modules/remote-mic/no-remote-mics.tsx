// oxlint-disable react-refresh/only-export-components
import { createContext, PropsWithChildren, useContext, useEffect } from 'react';

import RemoteMicServer from '~/modules/remote-mic/network/server';

const RemoteMicsAvailableContext = createContext(true);

/** Whether a phone can join as a mic here — false inside `NoRemoteMics`. */
export const useRemoteMicsAvailable = () => useContext(RemoteMicsAvailableContext);

/** A subtree where phones can't join as mics (online mode). Closes the mic server while mounted and
 * restores it after, and has the toolbar drop "Connect phone", which would reopen it. */
export function NoRemoteMics({ children }: PropsWithChildren) {
  useEffect(() => {
    const wasRunning = RemoteMicServer.stop();
    return () => {
      if (wasRunning) RemoteMicServer.start();
    };
  }, []);

  return <RemoteMicsAvailableContext value={false}>{children}</RemoteMicsAvailableContext>;
}
