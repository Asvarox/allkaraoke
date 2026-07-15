import { useState } from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import { MenuButton, MenuContainer } from '~/modules/elements/menu';
import Modal from '~/modules/elements/modal';
import SimplifiedMic from '~/modules/game-engine/input/simplified-mic';
import RemoteMicClient from '~/modules/remote-mic/network/client';
import { transportErrorReason } from '~/modules/remote-mic/network/client/network-client';
import usePermissions from '~/routes/remote-mic/hooks/use-permissions';
import RemoteInputLag from '~/routes/remote-mic/panels/remote-settings/input-lag';
import ManagePlayers from '~/routes/remote-mic/panels/remote-settings/manage-players';
import MicrophoneSettings from '~/routes/remote-mic/panels/remote-settings/microphone-settings';
import { ConnectionStatuses } from '~/routes/remote-mic/remote-mic';

import UnassignAfterSongFinishedSetting from './remote-settings/unassign-after-song-finished-setting';

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
    <div className="flex flex-grow flex-col justify-center gap-2.5 px-3 pt-12 pb-4 text-[1.625rem]">
      <span className="typography text-lg">
        Remote mic ID:{' '}
        <strong data-test="remote-mic-id">{RemoteMicClient.getClientId()?.slice(-4).toUpperCase() ?? '----'}</strong>
      </span>
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
      <Modal onClose={() => setOpenedPanel(null)} open={openedPanel !== null && permissions === 'write'}>
        <MenuContainer>
          <Menu.Header>{openedPanel === 'microphone' ? 'Microphone settings' : 'Manage game'}</Menu.Header>
          {openedPanel === 'microphone' && <MicrophoneSettings />}
          {openedPanel === 'manage' && (
            <>
              <ManagePlayers />
              <RemoteInputLag />
              <UnassignAfterSongFinishedSetting />
            </>
          )}
          <hr />
          <MenuButton onClick={() => setOpenedPanel(null)} size="small" data-test="close-modal">
            Close
          </MenuButton>
        </MenuContainer>
      </Modal>
      <div role="button" className="typography mt-auto" onClick={() => setIsKeepAwakeOn(!isKeepAwakeOn)}>
        WakeLock: <strong>{isKeepAwakeOn ? 'ON' : 'OFF'}</strong>
      </div>
      <div
        role="button"
        className="typography"
        onClick={() => (monitoringStarted ? SimplifiedMic.stopMonitoring() : SimplifiedMic.startMonitoring())}>
        Microphone: <strong data-test="monitoring-state">{monitoringStarted ? 'ON' : 'OFF'}</strong>
      </div>
    </div>
  );
}

export default RemoteSettings;
