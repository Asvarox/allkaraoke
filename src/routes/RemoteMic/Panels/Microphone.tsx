import styled from '@emotion/styled';
import { transportErrorReason } from 'modules/RemoteMic/Network/Client/NetworkClient';
import UserMediaEnabled from 'modules/UserMedia/UserMediaEnabled';
import isDev from 'modules/utils/isDev';
import { useState } from 'react';
import Connect from 'routes/RemoteMic/Panels/Microphone/Connect';
import RemoteMicKeyboard from 'routes/RemoteMic/Panels/Microphone/Keyboard';
import MicPreview from 'routes/RemoteMic/Panels/Microphone/MicPreview';
import { ConnectionStatuses } from 'routes/RemoteMic/RemoteMic';
import usePermissions from 'routes/RemoteMic/hooks/usePermissions';
import { AutoEnableFullscreenSetting, useSettingValue } from 'routes/Settings/SettingsState';

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
    <div className="landscap:flex-row text-md flex h-full flex-col items-center justify-center gap-8">
      <UserMediaEnabled
        showImages={false}
        fallback={
          <>
            {micPreview}
            <h2>Please allow access to the microphone.</h2>
          </>
        }>
        <Panel collapse={searchActive} className="flex flex-col gap-8 px-8">
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
        </Panel>
        <Panel className="px-8">
          {permissions === 'write' && <RemoteMicKeyboard onSearchStateChange={setSearchActive} />}
          {permissions === 'read' && (
            <NoPermissionsMsg data-test="no-permissions-message">
              No permission to control the game. Go to in-game <strong>Settings</strong> menu ➔{' '}
              <strong>Remote Microphones Settings</strong> to manage them.
            </NoPermissionsMsg>
          )}
        </Panel>
      </UserMediaEnabled>
    </div>
  );
}
export default Microphone;

const Panel = styled.div<{ collapse?: boolean }>`
  flex: 1;
  transition: 300ms ease-in-out;

  margin-top: ${(props) => (props.collapse ? '-100%' : '0')};

  @media (max-height: 500px) and (min-aspect-ratio: 16/10) {
    margin-top: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;

const NoPermissionsMsg = styled.h5`
  padding-bottom: 5rem;
`;
