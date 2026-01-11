import useRemoteMicServerStatus from 'modules/RemoteMic/hooks/useRemoteMicServerStatus';
import { useState } from 'react';
import { twc } from 'react-twc';

export default function ConnectionStatus() {
  const [display, setDisplay] = useState<boolean | null>(null);
  const { connected, isOnline, latency } = useRemoteMicServerStatus();

  if (display === null && isOnline) {
    setDisplay(true);
  }

  if (!display) {
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
