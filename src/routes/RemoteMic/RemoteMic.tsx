import styled from '@emotion/styled';
import NoSleep from '@uriopass/nosleep.js';
import { useBackground } from 'modules/Elements/LayoutWithBackground';
import NormalizeFontSize from 'modules/Elements/NormalizeFontSize';
import { switchToTheme } from 'modules/GameEngine/Drawing/styles';
import { default as events, default as gameEvents } from 'modules/GameEvents/GameEvents';
import { useEventEffect, useEventListener } from 'modules/GameEvents/hooks';
import useQueryParam from 'modules/hooks/useQueryParam';
import { useLayoutEffect, useState } from 'react';
import LayoutGame from 'routes/LayoutGame';
import BottomBar from 'routes/RemoteMic/BottomBar';
import Microphone from 'routes/RemoteMic/Panels/Microphone';
import ConfirmReadiness from 'routes/RemoteMic/Panels/Microphone/ConfirmReadiness';
import RemoteSettings from 'routes/RemoteMic/Panels/RemoteSettings';
import RemoteSongList from 'routes/RemoteMic/Panels/RemoteSongList';

const noSleep = new NoSleep();

export type ConnectionStatuses = Parameters<typeof events.karaokeConnectionStatusChange.dispatch>[0] | 'uninitialised';

export type PhoneTabs = 'microphone' | 'song-list' | 'settings';

function RemoteMic() {
  const roomId = useQueryParam('room');
  const [style] = useEventListener(gameEvents.remoteStyleChanged, true) ?? ['regular'];
  useLayoutEffect(() => {
    switchToTheme(style);
  }, [style]);
  useBackground(true, style);
  const [activeTab, setActiveTab] = useState<PhoneTabs>('microphone');

  const [connectionStatus, connectionError] = useEventListener(events.karaokeConnectionStatusChange) ?? [
    'uninitialised',
  ];

  const [monitoringStarted, setMonitoringStarted] = useState(false);
  useEventEffect(events.micMonitoringStarted, () => setMonitoringStarted(true));
  useEventEffect(events.micMonitoringStopped, () => setMonitoringStarted(false));

  const [isKeepAwakeOn, setIsKeepAwakeOn] = useState(false);

  const setKeepAwake = async (turnOn: boolean) => {
    try {
      if (turnOn && !noSleep.isEnabled) {
        await noSleep.enable();
      } else if (!turnOn && noSleep.isEnabled) {
        await noSleep.disable();
      }
      setIsKeepAwakeOn(turnOn);
    } catch (e) {
      console.warn("Couldn't set wakelock", e);
    }
  };

  const onConfirm = () => {
    setKeepAwake(true);
  };

  return (
    <LayoutGame>
      <ConfirmReadiness onConfirm={onConfirm} />
      <NormalizeFontSize size={10} />
      <Container id="phone-ui-container" className="pb-24 landscap:pb-0">
        <>
          {activeTab === 'microphone' && (
            <Microphone
              roomId={roomId}
              monitoringStarted={monitoringStarted}
              setMonitoringStarted={setMonitoringStarted}
              connectionStatus={connectionStatus}
              setIsKeepAwakeOn={setIsKeepAwakeOn}
              isKeepAwakeOn={isKeepAwakeOn}
              connectionError={connectionError}
            />
          )}
          {activeTab === 'song-list' && (
            <RemoteSongList
              roomId={roomId}
              monitoringStarted={monitoringStarted}
              setMonitoringStarted={setMonitoringStarted}
              connectionStatus={connectionStatus}
              setIsKeepAwakeOn={setIsKeepAwakeOn}
              isKeepAwakeOn={isKeepAwakeOn}
              connectionError={connectionError}
            />
          )}
          {activeTab === 'settings' && (
            <RemoteSettings
              roomId={roomId}
              monitoringStarted={monitoringStarted}
              setMonitoringStarted={setMonitoringStarted}
              connectionStatus={connectionStatus}
              setIsKeepAwakeOn={setIsKeepAwakeOn}
              isKeepAwakeOn={isKeepAwakeOn}
              connectionError={connectionError}
            />
          )}
          <BottomBar setActiveTab={setActiveTab} active={activeTab} />
        </>
      </Container>
    </LayoutGame>
  );
}
export default RemoteMic;

const Container = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
  min-height: 100vh;
  max-height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;

  @media (max-height: 500px) and (min-aspect-ratio: 16/10) {
    max-width: 960px;
  }
`;
