import NoSleep from '@uriopass/nosleep.js';
import Typography from 'modules/Elements/AKUI/Primitives/Typography';
import { useBackground } from 'modules/Elements/BackgroundContext';
import { switchToTheme } from 'modules/GameEngine/Drawing/styles';
import { default as events, default as gameEvents } from 'modules/GameEvents/GameEvents';
import { useEventEffect, useEventListener } from 'modules/GameEvents/hooks';
import useQueryParam from 'modules/hooks/useQueryParam';
import { useLayoutEffect, useState } from 'react';
import LayoutGame from 'routes/LayoutGame';
import BottomBar from 'routes/RemoteMic/BottomBar';
import Microphone from 'routes/RemoteMic/Panels/Microphone';
import ConfirmReadiness from 'routes/RemoteMic/Panels/Microphone/ConfirmReadiness';
import Ping from 'routes/RemoteMic/Panels/Microphone/Ping';
import RemoteSettings from 'routes/RemoteMic/Panels/RemoteSettings';
import RemoteSongList from 'routes/RemoteMic/Panels/RemoteSongList';
import useSendInitialSongList from 'routes/RemoteMic/Panels/RemoteSongList/useSendInitialSongList';

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

  useSendInitialSongList(connectionStatus === 'connected');

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
    <LayoutGame
      toolbarContent={
        activeTab !== 'song-list' ? (
          <div className="flex w-[50vw] max-w-[150px] flex-col">
            <Typography className="text-xs">CONNECTION STATUS:</Typography>
            <Typography className="mr-auto text-sm">
              <strong data-test="connection-status">{connectionStatus?.toUpperCase()}</strong>{' '}
              {connectionStatus === 'connected' && (
                <>
                  (<Ping />)
                </>
              )}
            </Typography>
          </div>
        ) : undefined
      }>
      <ConfirmReadiness onConfirm={onConfirm} />
      <div
        id="phone-ui-container"
        className="landscap:max-w-[60rem] mx-auto flex h-screen w-full max-w-[25rem] flex-col gap-[1px] bg-black/50">
        <div className="flex flex-1 flex-col justify-center overflow-hidden">
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
        </div>
        <BottomBar setActiveTab={setActiveTab} active={activeTab} />
      </div>
    </LayoutGame>
  );
}
export default RemoteMic;
