import { useState } from 'react';
import { twc } from 'react-twc';
import useRemoteMicServerStatus from '~/modules/remote-mic/hooks/use-remote-mic-server-status';
import isE2E from '~/modules/utils/is-e2-e';

export default function ConnectionStatus() {
  const [display, setDisplay] = useState<boolean | null>(null);
  const { connected, isOnline, latency } = useRemoteMicServerStatus();

  if (display === null && isOnline) {
    setDisplay(true);
  }

  // Debug-only overlay - its live latency/connection count would make e2e/visual screenshots flaky
  if (!display || isE2E()) {
    return null;
  }

  return (
    <Container>
      <Row>
        <strong>Remote mic server</strong>: {isOnline ? 'Online' : 'Offline'}
        {isOnline && latency && <> ({latency}ms)</>}
      </Row>
      {isOnline && (
        <>
          <Row>
            <strong>connected mics</strong>: {connected.length}
          </Row>
        </>
      )}
    </Container>
  );
}

const Container = twc.div`typography pointer-events-none fixed right-0 bottom-0 z-[100000] flex gap-2.5 text-sm opacity-75 sm:p-1`;

const Row = twc.div``;
