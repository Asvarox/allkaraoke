import styled from '@emotion/styled';
import { MenuButton, MenuContainer } from 'modules/Elements/Menu';
import Modal from 'modules/Elements/Modal';
import SimplifiedMic from 'modules/GameEngine/Input/SimplifiedMic';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import { transportErrorReason } from 'modules/RemoteMic/Network/Client/NetworkClient';
import { useState } from 'react';
import RemoteInputLag from 'routes/RemoteMic/Panels/RemoteSettings/InputLag';
import ManagePlayers from 'routes/RemoteMic/Panels/RemoteSettings/ManagePlayers';
import MicrophoneSettings from 'routes/RemoteMic/Panels/RemoteSettings/MicrophoneSettings';
import { ConnectionStatuses } from 'routes/RemoteMic/RemoteMic';
import usePermissions from 'routes/RemoteMic/hooks/usePermissions';

interface Props {
  roomId: string | null;
  connectionStatus: ConnectionStatuses;
  connectionError?: transportErrorReason;
  isKeepAwakeOn: boolean;
  setIsKeepAwakeOn: (keepAwake: boolean) => void;
  monitoringStarted: boolean;
  setMonitoringStarted: (micMonitoring: boolean) => void;
}

function RemoteSettings({ setIsKeepAwakeOn, monitoringStarted, isKeepAwakeOn }: Props) {
  const permissions = usePermissions();
  const [openedPanel, setOpenedPanel] = useState<'microphone' | 'manage' | null>(
    permissions === 'write' ? null : 'microphone',
  );
  return (
    <Container>
      <h3>
        Remote mic ID:{' '}
        <strong data-test="remote-mic-id">{RemoteMicClient.getClientId()?.slice(-4).toUpperCase() ?? '----'}</strong>
      </h3>
      <hr />
      {permissions === 'write' && openedPanel === null && (
        <>
          <MenuButton
            onClick={() => setOpenedPanel('microphone')}
            size="small"
            data-test="microphone-settings"
            disabled={openedPanel === 'microphone'}>
            Microphone settings
          </MenuButton>
          <MenuButton
            onClick={() => setOpenedPanel('manage')}
            size="small"
            data-test="manage-game"
            disabled={openedPanel === 'manage'}>
            Manage the game
          </MenuButton>
        </>
      )}
      {permissions !== 'write' && <MicrophoneSettings />}
      {openedPanel !== null && permissions === 'write' && (
        <Modal onClose={() => setOpenedPanel(null)}>
          <MenuContainer>
            <ModalHeader>{openedPanel === 'microphone' ? 'Microphone settings' : 'Manage game'}</ModalHeader>
            {openedPanel === 'microphone' && <MicrophoneSettings />}
            {openedPanel === 'manage' && (
              <>
                <ManagePlayers />
                <RemoteInputLag />
              </>
            )}
            <hr />
            <MenuButton onClick={() => setOpenedPanel(null)} size="small" data-test="close-modal">
              Close
            </MenuButton>
          </MenuContainer>
        </Modal>
      )}
      <div role="button" className="typography mt-auto" onClick={() => setIsKeepAwakeOn(!isKeepAwakeOn)}>
        WakeLock: <strong>{isKeepAwakeOn ? 'ON' : 'OFF'}</strong>
      </div>
      <div
        role="button"
        className="typography"
        onClick={() => (monitoringStarted ? SimplifiedMic.stopMonitoring() : SimplifiedMic.startMonitoring(undefined))}>
        Microphone: <strong data-test="monitoring-state">{monitoringStarted ? 'ON' : 'OFF'}</strong>
      </div>
    </Container>
  );
}

export default RemoteSettings;

const Container = styled.div`
  flex-grow: 1;
  font-size: 2.6rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5rem 1.5rem 1.5rem;
  box-sizing: border-box;
  gap: 1rem;
`;

const ModalHeader = styled.h1`
  font-size: 3.25rem !important;
`;
