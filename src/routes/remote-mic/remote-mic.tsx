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
      <div id="phone-ui-container" className="mx-auto flex h-dvh w-full max-w-[45rem] flex-col landscape:max-w-none">
        <TopBar connectionStatus={connectionStatus} roomId={roomId} />
        {/* Landscape: the tab bar becomes a vertical rail on the left of the panel (top bar stays full width) */}
        <div className="flex min-h-0 flex-1 flex-col landscape:flex-row">
          <BottomBar setActiveTab={setActiveTab} active={activeTab} className="order-2 landscape:order-1" />
          <div className="order-1 flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-hidden landscape:order-2">
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
        </div>
      </div>
    </>
  );
}
export default RemoteMic;
