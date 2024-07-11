import styled from '@emotion/styled';
import { typography } from 'modules/Elements/cssMixins';
import events from 'modules/GameEvents/GameEvents';
import { useEventEffect, useEventListenerSelector } from 'modules/GameEvents/hooks';
import server from 'modules/RemoteMic/Network/Server';
import remoteMicManager from 'modules/RemoteMic/RemoteMicManager';
import { useEffect, useState } from 'react';
import { useInterval } from 'react-use';

export default function ConnectionStatus() {
  const [display, setDisplay] = useState<boolean | null>(null);
  const [isOnline, setIsOnline] = useState(server.isStarted());
  const [latency, setLatency] = useState<number | null>(server.getLatency());

  useInterval(() => {
    setLatency(server.getLatency());
  }, 1000);

  useEventEffect(events.micServerStarted, () => {
    setIsOnline(true);
  });

  useEventEffect(events.micServerStopped, () => {
    setIsOnline(false);
  });

  const connected = useEventListenerSelector(
    [events.remoteMicConnected, events.remoteMicDisconnected],
    () => remoteMicManager.getRemoteMics(),
    [isOnline],
  );

  useEffect(() => {
    if (display === null && isOnline) {
      setDisplay(true);
    }
  }, [isOnline, display]);

  if (!display) {
    return null;
  }

  return (
    <Container>
      <Row>
        <strong>Remote mic server</strong>: {isOnline ? 'Online' : 'Offline'}
        {isOnline && server.getGameCode().startsWith('w') && <> ({latency}ms)</>}
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
