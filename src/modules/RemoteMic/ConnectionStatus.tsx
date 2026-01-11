import styled from '@emotion/styled';
import { useState } from 'react';
import { typography } from '~/modules/Elements/cssMixins';
import useRemoteMicServerStatus from '~/modules/RemoteMic/hooks/useRemoteMicServerStatus';

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

const Container = styled.div`
  opacity: 0.75;
  position: fixed;
  bottom: 0;
  right: 0;

  ${typography};
  font-size: 1.5rem;

  padding: 0.5rem;
  display: flex;
  gap: 1rem;
  z-index: 100000;

  pointer-events: none;
`;

const Row = styled.div``;
