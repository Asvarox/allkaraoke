import NoSleep from '@uriopass/nosleep.js';
import { useLayoutEffect, useState } from 'react';
import { useBackground } from '~/modules/Elements/BackgroundContext';
import { switchToTheme } from '~/modules/GameEngine/Drawing/styles';
import events from '~/modules/GameEvents/GameEvents';
import { useEventEffect, useEventListener } from '~/modules/GameEvents/hooks';
import { useSubscription } from '~/modules/RemoteMic/Network/Client/hooks/useSubscription';
import useQueryParam from '~/modules/hooks/useQueryParam';
import BottomBar from '~/routes/RemoteMic/BottomBar';
import Microphone from '~/routes/RemoteMic/Panels/Microphone';
import ConfirmReadiness from '~/routes/RemoteMic/Panels/Microphone/ConfirmReadiness';
import RemoteSettings from '~/routes/RemoteMic/Panels/RemoteSettings';
import RemoteSongList from '~/routes/RemoteMic/Panels/RemoteSongList';
import useSendInitialSongList from '~/routes/RemoteMic/Panels/RemoteSongList/useSendInitialSongList';
import TopBar from '~/routes/RemoteMic/TopBar';

const noSleep = new NoSleep();

export type ConnectionStatuses = Parameters<typeof events.karaokeConnectionStatusChange.dispatch>[0] | 'uninitialised';

export type PhoneTabs = 'microphone' | 'song-list' | 'settings';

function RemoteMic() {
  const roomId = useQueryParam('room');
  const style = useSubscription('style') ?? 'regular';
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
    <>
      <ConfirmReadiness onConfirm={onConfirm} />
      <div id="phone-ui-container" className="mx-auto flex h-dvh w-full max-w-[30rem] flex-col">
        <TopBar connectionStatus={connectionStatus} />
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
    </>
  );
}
export default RemoteMic;
