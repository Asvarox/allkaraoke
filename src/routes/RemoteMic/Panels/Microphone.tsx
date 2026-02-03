import { useState } from 'react';
import { Menu } from '~/modules/Elements/AKUI/Menu';
import { transportErrorReason } from '~/modules/RemoteMic/Network/Client/NetworkClient';
import UserMediaEnabled from '~/modules/UserMedia/UserMediaEnabled';
import isDev from '~/modules/utils/isDev';
import Connect from '~/routes/RemoteMic/Panels/Microphone/Connect';
import RemoteMicKeyboard from '~/routes/RemoteMic/Panels/Microphone/Keyboard';
import MicPreview from '~/routes/RemoteMic/Panels/Microphone/MicPreview';
import { ConnectionStatuses } from '~/routes/RemoteMic/RemoteMic';
import usePermissions from '~/routes/RemoteMic/hooks/usePermissions';
import { AutoEnableFullscreenSetting, useSettingValue } from '~/routes/Settings/SettingsState';

interface Props {
  roomId: string | null;
  connectionStatus: ConnectionStatuses;
  connectionError?: transportErrorReason;
  isKeepAwakeOn: boolean;
  setIsKeepAwakeOn: (keepAwake: boolean) => void;
  monitoringStarted: boolean;
  setMonitoringStarted: (micMonitoring: boolean) => void;
}

function Microphone({ roomId, monitoringStarted, setIsKeepAwakeOn, connectionError, connectionStatus }: Props) {
  const permissions = usePermissions();
  const [searchActive, setSearchActive] = useState(false);
  const [autoEnableFullscreen] = useSettingValue(AutoEnableFullscreenSetting);
  const [triggerPlayerChangeModal, setTriggerPlayerChangeModal] = useState(false);

  const onConnect = async () => {
    setTriggerPlayerChangeModal(true);
    setIsKeepAwakeOn(true);

    try {
      if (!isDev() && autoEnableFullscreen) {
        await document.body.requestFullscreen();
        global.screen.orientation.unlock();
        await global.screen.orientation.lock?.('portrait');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const isConnected = connectionStatus === 'connected';

  const micPreview = <MicPreview isVisible isMicOn={monitoringStarted} isConnected={isConnected} />;

  return (
    <div className="landscap:flex-row landscap:pt-0 text-md landscap:gap-4 flex h-full flex-col items-center justify-center gap-4 overflow-auto px-4 pt-16">
      <UserMediaEnabled
        showImages={false}
        fallback={
          <>
            {micPreview}
            <span className="typography text-xl">Please allow access to the microphone.</span>
          </>
        }>
        <div
          className={`landscap:mt-0 landscap:flex flex-1.5 landscap:flex-col flex w-full flex-col justify-center gap-4 transition-all duration-300 ease-in-out ${searchActive ? 'mt-[-100%]' : 'mt-0'}`}>
          <MicPreview
            isVisible={isConnected}
            isMicOn={monitoringStarted}
            isConnected={isConnected}
            showPlayerChangeModal={triggerPlayerChangeModal}
          />
          <Connect
            roomId={roomId}
            isVisible={true}
            connectionStatus={connectionStatus}
            onConnect={onConnect}
            connectionError={connectionError}
          />
        </div>
        <div>
          {permissions === 'write' && <RemoteMicKeyboard onSearchStateChange={setSearchActive} />}
          {permissions === 'read' && (
            <Menu.HelpText className="pb-12" data-test="no-permissions-message">
              No permission to control the game. Go to in-game <strong>Settings</strong> menu ➔{' '}
              <strong>Remote Microphones Settings</strong> to manage them.
            </Menu.HelpText>
          )}
        </div>
      </UserMediaEnabled>
    </div>
  );
}
export default Microphone;
