import NoSleep from '@uriopass/nosleep.js';
import { useLayoutEffect, useState } from 'react';

import { useBackground } from '~/modules/elements/background-context';
import { switchToTheme } from '~/modules/game-engine/drawing/styles';
import events from '~/modules/game-events/game-events';
import { useEventEffect, useEventListener } from '~/modules/game-events/hooks';
import useQueryParam from '~/modules/hooks/use-query-param';
import { useSubscription } from '~/modules/remote-mic/network/client/hooks/use-subscription';
import BottomBar from '~/routes/remote-mic/bottom-bar';
import Microphone from '~/routes/remote-mic/panels/microphone';
import ConfirmReadiness from '~/routes/remote-mic/panels/microphone/confirm-readiness';
import RemoteSettings from '~/routes/remote-mic/panels/remote-settings';
import RemoteSongList from '~/routes/remote-mic/panels/remote-song-list';
import useSendInitialSongList from '~/routes/remote-mic/panels/remote-song-list/use-send-initial-song-list';
import TopBar from '~/routes/remote-mic/top-bar';

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
      <div id="phone-ui-container" className="mx-auto flex h-dvh w-full max-w-[45rem] flex-col">
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
